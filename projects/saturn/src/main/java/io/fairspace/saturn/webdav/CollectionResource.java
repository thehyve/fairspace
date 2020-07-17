package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.FileItem;
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

import static io.fairspace.saturn.auth.RequestContext.isAdmin;
import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.DavFactory.currentUserResource;
import static io.fairspace.saturn.webdav.PathUtils.name;
import static io.milton.property.PropertySource.PropertyAccessibility.READ_ONLY;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;
import static java.lang.String.join;

class CollectionResource extends DirectoryResource implements DisplayNameResource {
    private static final QName OWNED_BY_PROPERTY = new QName(FS.ownedBy.getNameSpace(), FS.ownedBy.getLocalName());
    private static final QName CREATED_BY_PROPERTY = new QName(FS.createdBy.getNameSpace(), FS.createdBy.getLocalName());
    private static final QName COMMENT_PROPERTY = new QName(RDFS.comment.getNameSpace(), RDFS.comment.getLocalName());
    private static final QName ACCESS_PROPERTY = new QName(FS.NS, "access");
    private static final QName SHARED_WITH_PROPERTY = new QName(FS.NS, FS.sharedWith.getLocalName());
    private static final QName PERMISSIONS_PROPERTY = new QName(FS.NS, "permissions");
    private static final PropertyMetaData OWNED_BY_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData CREATED_BY_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData COMMENT_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData ACCESS_PROPERTY_META = new PropertyMetaData(READ_ONLY, Boolean.class);
    private static final PropertyMetaData SHARED_WITH_PROPERTY_META = new PropertyMetaData(READ_ONLY, String.class);
    private static final PropertyMetaData PERMISSIONS_PROPERTY_META = new PropertyMetaData(READ_ONLY, String.class);
    private static final List<QName> COLLECTION_PROPERTIES = List.of(
            IRI_PROPERTY, IS_READONLY_PROPERTY, DATE_DELETED_PROPERTY, OWNED_BY_PROPERTY, CREATED_BY_PROPERTY,
            COMMENT_PROPERTY, ACCESS_PROPERTY, SHARED_WITH_PROPERTY, PERMISSIONS_PROPERTY
    );

    public CollectionResource(DavFactory factory, Resource subject, Access access) {
        super(factory, subject, access);
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
        if (name.equals(SHARED_WITH_PROPERTY)) {
            return join(",", () -> subject.listProperties(FS.sharedWith)
                    .mapWith(Statement::getResource)
                    .filterDrop(r -> r.hasProperty(FS.dateDeleted))
                    .mapWith(Resource::getURI));
        }
        if (name.equals(PERMISSIONS_PROPERTY)) {
            var builder = new StringBuilder();

            dumpPermissions(FS.manage, Access.Manage, builder);
            dumpPermissions(FS.write, Access.Write, builder);
            dumpPermissions(FS.read, Access.Read, builder);
            dumpPermissions(FS.list, Access.List, builder);

            return builder.toString();
        }
        return super.getProperty(name);
    }

    private void dumpPermissions(Property property, Access access, StringBuilder builder) {
        subject.listProperties(property)
                .mapWith(Statement::getResource)
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
            if (subject.hasProperty(FS.ownedBy) && !isAdmin()) {
                throw new NotAuthorizedException();
            }

            var ws = subject.getModel().createResource(value.toString());
            if (!ws.hasProperty(RDF.type, FS.Workspace) || ws.hasProperty(FS.dateDeleted)) {
                throw new PropertySetException(Response.Status.SC_BAD_REQUEST, "Invalid workspace IRI");
            }

            // TODO: Use the new WorkspaceService
            if (!isAdmin() && !ws.hasLiteral(FS.manage, currentUserResource())) {
                throw new NotAuthorizedException();
            }

            if (!ws.hasLiteral(FS.status, WorkspaceStatus.Active.name())) {
                throw new NotAuthorizedException();
            }

            subject.removeAll(FS.ownedBy).addProperty(FS.ownedBy, ws);
        }
        super.setProperty(name, value);
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
        if (name.equals(SHARED_WITH_PROPERTY)) {
            return SHARED_WITH_PROPERTY_META;
        }
        if (name.equals(PERMISSIONS_PROPERTY)) {
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
            case "share_with_user" -> shareWithUser(getResourceParameter(parameters, "user", FS.User), getEnumParameter(parameters, "access", Access.class));
            case "share_with_workspace" -> shareWithWorkspace(getResourceParameter(parameters, "workspace", FS.Workspace));
            case "unshare_with_workspace" -> unshareWithWorkspace(getResourceParameter(parameters, "workspace", FS.Workspace));
            default -> super.performAction(action, parameters, files);
        }
    }

    private void setAccessMode(AccessMode mode) {
        subject.removeAll(FS.accessMode).addProperty(FS.accessMode, mode.name());
    }

    private void shareWithUser(Resource user, Access access) {
        subject.getModel()
                .removeAll(subject, FS.list, user)
                .removeAll(subject, FS.read, user)
                .removeAll(subject, FS.write, user)
                .removeAll(subject, FS.manage, user);

        switch (access) {
            case List -> subject.addProperty(FS.list, user);
            case Read -> subject.addProperty(FS.read, user);
            case Write -> subject.addProperty(FS.write, user);
            case Manage -> subject.addProperty(FS.manage, user);
        }
    }

    private void shareWithWorkspace(Resource workspace) {
        subject.addProperty(FS.sharedWith,  workspace);
    }

    private void unshareWithWorkspace(Resource workspace) {
        subject.getModel().removeAll(subject, FS.sharedWith,  workspace);
    }

    private <T extends Enum<T>> T getEnumParameter(Map<String, String> parameters, String name, Class<T> type) throws BadRequestException {
        checkParameterPresence(parameters, name);
        try {
            return Enum.valueOf(type, parameters.get(name));
        } catch (Exception e) {
            throw new BadRequestException(this, "Invalid \"" + name + "\" parameter");
        }
    }

    private Resource getResourceParameter(Map<String, String> parameters, String name, Resource expectedType) throws BadRequestException {
        checkParameterPresence(parameters, name);

        Resource r = null;
        try {
            r = subject.getModel().createResource(parameters.get(name));
        } catch (Exception ignore) {
        }
        if (r == null || !r.hasProperty(RDF.type, expectedType) || r.hasProperty(FS.dateDeleted)) {
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
