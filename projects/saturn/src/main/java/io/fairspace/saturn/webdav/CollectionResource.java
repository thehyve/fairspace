package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
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
import static io.fairspace.saturn.webdav.PathUtils.decodePath;
import static io.milton.property.PropertySource.PropertyAccessibility.READ_ONLY;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;

class CollectionResource extends DirectoryResource implements DisplayNameResource {
    private static final QName OWNED_BY_PROPERTY = new QName(FS.ownedBy.getNameSpace(), FS.ownedBy.getLocalName());
    private static final QName CREATED_BY_PROPERTY = new QName(FS.createdBy.getNameSpace(), FS.createdBy.getLocalName());
    private static final QName COMMENT_PROPERTY = new QName(RDFS.comment.getNameSpace(), RDFS.comment.getLocalName());
    private static final QName ACCESS_PROPERTY = new QName(FS.NS, "access");
    private static final PropertyMetaData OWNED_BY_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData CREATED_BY_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData COMMENT_PROPERTY_META = new PropertyMetaData(WRITABLE, String.class);
    private static final PropertyMetaData ACCESS_PROPERTY_META = new PropertyMetaData(READ_ONLY, Boolean.class);
    private static final List<QName> COLLECTION_PROPERTIES = List.of(
            IRI_PROPERTY, IS_READONLY_PROPERTY, DATE_DELETED_PROPERTY, OWNED_BY_PROPERTY, CREATED_BY_PROPERTY,
            COMMENT_PROPERTY, ACCESS_PROPERTY
    );

    public CollectionResource(DavFactory factory, Resource subject, Access access) {
        super(factory, subject, access);
    }

    @Override
    public String getName() {
        return decodePath(subject.getLocalName());
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
        return super.getProperty(name);
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
        return super.getPropertyMetaData(name);
    }

    @Override
    public List<QName> getAllPropertyNames() {
        return COLLECTION_PROPERTIES;
    }

    @Override
    protected void performAction(String action, Map<String, String> parameters, Map<String, FileItem> files) throws BadRequestException, NotAuthorizedException, ConflictException {
        switch (action) {
            case "set_access_mode" -> setAccessMode(parameters.get("mode"));
            case "share_with_user" -> shareWithUser(parameters.get("user"), parameters.get("access"));
            case "share_with_workspace" -> shareWithWorkspace(parameters.get("workspace"));
            case "unshare_with_workspace" -> unshareWithWorkspace(parameters.get("workspace"));
            case "publish" -> publish();
            case "unpublish" -> unpublish();
            default -> super.performAction(action, parameters, files);
        }
    }

    private void setAccessMode(String modeStr) throws BadRequestException, NotAuthorizedException, ConflictException {
        AccessMode mode;
        try {
            mode = AccessMode.valueOf(modeStr);
        } catch (Exception e) {
            throw new BadRequestException("Invalid access mode: " + modeStr);
        }
        subject.removeAll(FS.accessMode).addProperty(FS.accessMode, mode.name());
    }

    private void shareWithUser(String user, String access) throws BadRequestException, NotAuthorizedException, ConflictException {

    }

    private void shareWithWorkspace(String workspace) throws BadRequestException, NotAuthorizedException, ConflictException {

    }

    private void unshareWithWorkspace(String workspace) throws BadRequestException, NotAuthorizedException, ConflictException {

    }

    private void publish() throws BadRequestException, NotAuthorizedException, ConflictException {

    }

    private void unpublish() throws BadRequestException, NotAuthorizedException, ConflictException {

    }
}
