package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.FileItem;
import io.milton.http.Request;
import io.milton.http.Response;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.property.PropertySource.PropertyMetaData;
import io.milton.property.PropertySource.PropertySetException;
import io.milton.resource.DisplayNameResource;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import javax.xml.namespace.QName;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static io.fairspace.saturn.auth.RequestContext.isAdmin;
import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.PathUtils.name;
import static io.milton.property.PropertySource.PropertyAccessibility.READ_ONLY;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;

class CollectionResource extends DirectoryResource implements DisplayNameResource {
    private static final QName OWNED_BY_PROPERTY = new QName(FS.ownedBy.getNameSpace(), FS.ownedBy.getLocalName());
    private static final QName CREATED_BY_PROPERTY = new QName(FS.createdBy.getNameSpace(), FS.createdBy.getLocalName());
    private static final QName COMMENT_PROPERTY = new QName(RDFS.comment.getNameSpace(), RDFS.comment.getLocalName());
    private static final QName ACCESS_PROPERTY = new QName(FS.NS, "access");
    private static final QName USER_PERMISSIONS_PROPERTY = new QName(FS.NS, "userPermissions");
    private static final QName WORKSPACE_PERMISSIONS_PROPERTY = new QName(FS.NS, "workspacePermissions");
    private static final PropertyMetaData OWNED_BY_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData CREATED_BY_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData COMMENT_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData ACCESS_PROPERTY_META = new PropertyMetaData(READ_ONLY, Boolean.class);
    private static final PropertyMetaData PERMISSIONS_PROPERTY_META = new PropertyMetaData(READ_ONLY, String.class);
    private static final List<QName> COLLECTION_PROPERTIES = List.of(
            IRI_PROPERTY, IS_READONLY_PROPERTY, DATE_DELETED_PROPERTY, OWNED_BY_PROPERTY, CREATED_BY_PROPERTY,
            COMMENT_PROPERTY, ACCESS_PROPERTY, USER_PERMISSIONS_PROPERTY, WORKSPACE_PERMISSIONS_PROPERTY
    );

    public CollectionResource(DavFactory factory, Resource subject, Access access) {
        super(factory, subject, access);
    }

    @Override
    public boolean authorise(Request request, Request.Method method, Auth auth) {
        return switch (method) {
            case DELETE -> access.canManage();
            default -> super.authorise(request, method, auth);
        };
    }

    @Override
    public String getName() {
        return name(subject.getURI());
    }

    @Override
    public String getDisplayName() {
        return getStringProperty(subject, RDFS.label);
    }

    @Override
    public void setDisplayName(String s) {
        subject.removeAll(RDFS.label).addProperty(RDFS.label, s);
    }

    @Override
    public void moveTo(io.milton.resource.CollectionResource rDest, String name) throws ConflictException, NotAuthorizedException, BadRequestException {
        if (!(rDest instanceof RootResource)) {
            throw new BadRequestException(this, "Cannot move a collection to a non-root folder.");
        }
        var existing = ((RootResource) rDest).findExistingCollectionWithNameIgnoreCase(name);
        if (existing != null) {
            throw new ConflictException(
                    existing, "Target already exists (modulo case).");
        }
        var oldName = getStringProperty(subject, RDFS.label);
        super.moveTo(rDest, name);
        var newSubject = childSubject(factory.rootSubject, name);
        newSubject.removeAll(RDFS.label).addProperty(RDFS.label, oldName);
    }

    @Override
    public void copyTo(io.milton.resource.CollectionResource toCollection, String name) throws NotAuthorizedException, BadRequestException, ConflictException {
        if (!(toCollection instanceof RootResource)) {
            throw new BadRequestException(this, "Cannot copy a collection to a non-root folder.");
        }
        var existing = ((RootResource) toCollection).findExistingCollectionWithNameIgnoreCase(name);
        if (existing != null) {
            throw new ConflictException(
                    existing, "Target already exists (modulo case).");
        }
        super.copyTo(toCollection, name);
    }

    @Override
    public Object getProperty(QName name) {
        if (name.equals(OWNED_BY_PROPERTY)) {
            return subject.listProperties(FS.ownedBy).nextOptional().map(Statement::getResource).map(Resource::getURI).orElse(null);
        }
        if (name.equals(CREATED_BY_PROPERTY)) {
            return subject.listProperties(FS.createdBy).nextOptional().map(Statement::getResource).map(Resource::getURI).orElse(null);
        }
        if (name.equals(COMMENT_PROPERTY)) {
            return subject.listProperties(RDFS.comment).nextOptional().map(Statement::getString).orElse(null);
        }
        if (name.equals(ACCESS_PROPERTY)) {
            return access;
        }
        if (name.equals(USER_PERMISSIONS_PROPERTY)) {
            return getPermissions(FS.User);
        }
        if (name.equals(WORKSPACE_PERMISSIONS_PROPERTY)) {
            return getPermissions(FS.Workspace);
        }
        return super.getProperty(name);
    }

    private String getPermissions(Resource principalType) {
        var builder = new StringBuilder();

        dumpPermissions(FS.manage, Access.Manage, principalType, builder);
        dumpPermissions(FS.write, Access.Write, principalType, builder);
        dumpPermissions(FS.read, Access.Read, principalType, builder);
        dumpPermissions(FS.list, Access.List, principalType, builder);

        return builder.toString();
    }

    private void dumpPermissions(Property property, Access access, Resource type, StringBuilder builder) {
        subject.listProperties(property)
                .mapWith(Statement::getResource)
                .filterKeep(r -> r.hasProperty(RDF.type, type))
                .filterDrop(r -> r.hasProperty(FS.dateDeleted))
                .mapWith(Resource::getURI)
                .forEachRemaining(uri -> {
                    if (builder.length() > 0) {
                        builder.append(',');
                    }
                    builder.append(uri).append(' ').append(access);
                });
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySetException, NotAuthorizedException {
        if (name.equals(OWNED_BY_PROPERTY)) {
            setOwner(subject.getModel().createResource(value.toString()));
        }
        super.setProperty(name, value);
    }

    private void setOwner(Resource ws) throws NotAuthorizedException {
        var old = subject.getPropertyResourceValue(FS.ownedBy);

        if (old != null) {
            if (old.equals(ws)) {
                return;
            }
            if (!isAdmin()) {
                throw new NotAuthorizedException();
            }
        }

        if (!ws.hasProperty(RDF.type, FS.Workspace) || ws.hasProperty(FS.dateDeleted)) {
            throw new PropertySetException(Response.Status.SC_BAD_REQUEST, "Invalid workspace IRI");
        }

        // TODO: Use the new WorkspaceService
        if (!isAdmin() && !ws.hasLiteral(FS.manage, factory.currentUserResource())) {
            throw new NotAuthorizedException();
        }

        if (!ws.hasLiteral(FS.status, WorkspaceStatus.Active.name())) {
            throw new NotAuthorizedException();
        }

        subject.removeAll(FS.ownedBy).addProperty(FS.ownedBy, ws);

        if (old != null) {
            old.listProperties(FS.manage)
                   .andThen(old.listProperties(FS.member))
                   .mapWith(Statement::getResource)
                    .filterDrop(user -> ws.hasProperty(FS.member, user) || ws.hasProperty(FS.manage, user))
                    .filterKeep(user -> subject.hasProperty(FS.manage, user) || subject.hasProperty(FS.write, user))
                    .toList()
                    .forEach(user -> user.getModel()
                            .remove(subject, FS.manage, user)
                            .remove(subject, FS.write, user)
                            .add(subject, FS.read, user));
        }
    }

    @Override
    public PropertyMetaData getPropertyMetaData(QName name) {
        if (name.equals(OWNED_BY_PROPERTY)) {
            return OWNED_BY_PROPERTY_META;
        }
        if (name.equals(CREATED_BY_PROPERTY)) {
            return CREATED_BY_PROPERTY_META;
        }
        if (name.equals(COMMENT_PROPERTY)) {
            return COMMENT_PROPERTY_META;
        }
        if (name.equals(ACCESS_PROPERTY)) {
            return ACCESS_PROPERTY_META;
        }
        if (name.equals(USER_PERMISSIONS_PROPERTY) || name.equals(WORKSPACE_PERMISSIONS_PROPERTY)) {
            return PERMISSIONS_PROPERTY_META;
        }
        return super.getPropertyMetaData(name);
    }

    @Override
    public List<QName> getAllPropertyNames() {
        return COLLECTION_PROPERTIES;
    }

    @Override
    protected void performAction(String action, Map<String, String> parameters, Map<String, FileItem> files) throws BadRequestException, NotAuthorizedException, ConflictException {
        switch (action) {
            case "set_access_mode" -> setAccessMode(getEnumParameter(parameters, "mode", AccessMode.class));
            case "set_permission" -> setPermission(getResourceParameter(parameters, "principal"), getEnumParameter(parameters, "access", Access.class));
            default -> super.performAction(action, parameters, files);
        }
    }

    private void setAccessMode(AccessMode mode) throws NotAuthorizedException {
        if (!access.canManage()) {
            throw new NotAuthorizedException(this);
        }
        subject.removeAll(FS.accessMode).addProperty(FS.accessMode, mode.name());
    }

    private void setPermission(Resource principal, Access grantedAccess) throws BadRequestException, NotAuthorizedException {
        if (!access.canManage()) {
            throw new NotAuthorizedException(this);
        }
        if (principal.hasProperty(RDF.type, FS.User)) {
            if (grantedAccess == Access.Write || grantedAccess == Access.Manage) {
                var ownerWs = subject.getPropertyResourceValue(FS.ownedBy);
                if (!principal.hasProperty(FS.member, ownerWs) && !principal.hasProperty(FS.manage, ownerWs)) {
                    throw new BadRequestException(this);
                }
            }
        } else if (principal.hasProperty(RDF.type, FS.Workspace)) {
            if ((grantedAccess == Access.Write || grantedAccess == Access.Manage) && !subject.hasProperty(FS.ownedBy, principal)) {
                throw new BadRequestException(this);
            }
        } else {
            throw new BadRequestException(this, "Invalid principal");
        }

        subject.getModel()
                .removeAll(subject, FS.list, principal)
                .removeAll(subject, FS.read, principal)
                .removeAll(subject, FS.write, principal)
                .removeAll(subject, FS.manage, principal);

        switch (grantedAccess) {
            case List -> subject.addProperty(FS.list, principal);
            case Read -> subject.addProperty(FS.read, principal);
            case Write -> subject.addProperty(FS.write, principal);
            case Manage -> subject.addProperty(FS.manage, principal);
        }

        if (principal.hasProperty(RDF.type, FS.User) && principal.hasProperty(FS.email)) {
            var message = grantedAccess == Access.None
                    ? "Your access to collection " + getName() + " has been revoked."
                    : "You've been granted " + grantedAccess.name().toLowerCase() + " access to collection " +  getName() + "\n" + subject.getURI();
            var email = principal.getProperty(FS.email).getString();
            getCurrentRequest().setAttribute(WebDAVServlet.POST_COMMIT_ACTION_ATTRIBUTE,
                    (Runnable) () -> factory.mailService.send(email, "Your access permissions changed", message));

        }
    }

    @Override
    protected void undelete() throws BadRequestException, NotAuthorizedException, ConflictException {
        if (!access.canManage()) {
            throw new NotAuthorizedException(this);
        }
        super.undelete();
    }

    private <T extends Enum<T>> T getEnumParameter(Map<String, String> parameters, String name, Class<T> type) throws BadRequestException {
        checkParameterPresence(parameters, name);
        try {
            return Enum.valueOf(type, parameters.get(name));
        } catch (Exception e) {
            throw new BadRequestException(this, "Invalid \"" + name + "\" parameter");
        }
    }

    private Resource getResourceParameter(Map<String, String> parameters, String name) throws BadRequestException {
        checkParameterPresence(parameters, name);

        Resource r = null;
        try {
            r = subject.getModel().createResource(parameters.get(name));
        } catch (Exception ignore) {
        }
        if (r == null || r.hasProperty(FS.dateDeleted)) {
            throw new BadRequestException(this, "Invalid \"" + name + "\" parameter");
        }
        return r;
    }

    private void checkParameterPresence(Map<String, String> parameters, String name) throws BadRequestException {
        if (!parameters.containsKey(name)) {
            throw new BadRequestException(this, "Missing \"" + name + "\" parameter");
        }
    }
}
