package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.*;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.webdav.WebDavProtocol;
import io.milton.property.PropertySource;
import io.milton.resource.*;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import javax.xml.namespace.QName;
import java.util.Date;
import java.util.Map;

import static io.fairspace.saturn.auth.RequestContext.isAdmin;
import static io.fairspace.saturn.rdf.ModelUtils.*;
import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTimeLiteral;
import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.DavFactory.currentUserResource;
import static io.fairspace.saturn.webdav.WebDAVServlet.getBlob;
import static io.fairspace.saturn.webdav.WebDAVServlet.timestampLiteral;
import static io.milton.property.PropertySource.PropertyAccessibility.READ_ONLY;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;

abstract class BaseResource implements PropFindableResource, DeletableResource, MoveableResource, CopyableResource, MultiNamespaceCustomPropertyResource, ConditionalCompatibleResource, PostableResource {
    protected static final QName IRI_PROPERTY = new QName(FS.NS, "iri");
    private static final PropertySource.PropertyMetaData IRI_PROPERTY_META = new PropertySource.PropertyMetaData(READ_ONLY, String.class);
    protected static final QName IS_READONLY_PROPERTY = new QName(WebDavProtocol.DAV_URI, "isreadonly");
    private static final PropertySource.PropertyMetaData IS_READONLY_PROPERTY_META = new PropertySource.PropertyMetaData(READ_ONLY, Boolean.class);
    protected static final QName DATE_DELETED_PROPERTY = new QName(FS.dateDeleted.getNameSpace(), FS.dateDeleted.getLocalName());
    private static final PropertySource.PropertyMetaData DATE_DELETED_PROPERTY_META = new PropertySource.PropertyMetaData(WRITABLE, Date.class);


    protected final DavFactory factory;
    protected final org.apache.jena.rdf.model.Resource subject;
    protected final Access access;

    BaseResource(DavFactory factory, Resource subject, Access access) {
        this.factory = factory;
        this.subject = subject;
        this.access = access;
    }

    @Override
    public String getUniqueId() {
        return subject.getURI();
    }

    @Override
    public String getName() {
        return subject.getRequiredProperty(RDFS.label).getString();
    }

    @Override
    public Object authenticate(String user, String password) {
        return null;
    }

    @Override
    public boolean authorise(Request request, Request.Method method, Auth auth) {
        if (isAdmin()) {
            return true;
        }
        if (method == Request.Method.GET) {
            return access.canRead();
        }
        if (method.isWrite) {
            return access.canWrite();
        }
        return true;
    }

    @Override
    public String getRealm() {
        return null;
    }

    @Override
    public String checkRedirect(Request request) throws NotAuthorizedException, BadRequestException {
        return null;
    }

    @Override
    public Date getCreateDate() {
        return parseDate(subject, FS.dateCreated);
    }

    @Override
    public final void delete() throws NotAuthorizedException, ConflictException, BadRequestException {
        delete(subject.hasProperty(FS.dateDeleted));
    }

    protected void delete(boolean purge) throws NotAuthorizedException, ConflictException, BadRequestException {
        if (purge) {
            subject.getModel().removeAll(subject, null, null).removeAll(null, null, subject);
        } else if (!subject.hasProperty(FS.dateDeleted)) {
            subject.addProperty(FS.dateDeleted, timestampLiteral())
                    .addProperty(FS.deletedBy, currentUserResource());
        }
    }

    @Override
    public void moveTo(io.milton.resource.CollectionResource rDest, String name) throws ConflictException, NotAuthorizedException, BadRequestException {
        var existing = rDest.child(name);
        if (existing != null) {
            throw new ConflictException(existing);
        }
        move(subject, (rDest instanceof DirectoryResource) ? ((DirectoryResource) rDest).subject : null, name);
    }

    private void move(org.apache.jena.rdf.model.Resource subject, org.apache.jena.rdf.model.Resource parent, String name) {
        var newSubject = childSubject(parent != null ? parent : factory.rootSubject, name);
        newSubject.removeProperties().addProperty(RDFS.label, name);
        if (parent != null) {
            parent.addProperty(FS.contains, newSubject);
        }

        subject.listProperties()
                .filterDrop(stmt -> stmt.getPredicate().equals(RDFS.label))
                .filterDrop(stmt -> stmt.getPredicate().equals(FS.contains))
                .filterDrop(stmt -> stmt.getPredicate().equals(FS.versions))
                .forEachRemaining(stmt -> newSubject.addProperty(stmt.getPredicate(), stmt.getObject()));

        var versions = getListProperty(subject, FS.versions);


        if (versions != null) {
            var newVersions = subject.getModel().createList(versions.iterator()
                    .mapWith(RDFNode::asResource)
                    .mapWith(BaseResource::copyVersion));
            newSubject.addProperty(FS.versions, newVersions);
        }

        getResourceProperties(subject, FS.contains)
                .forEach(r -> move(r, newSubject, getStringProperty(r, RDFS.label)));

        subject.getModel().listStatements(null, null, subject)
                .filterDrop(stmt -> stmt.getPredicate().equals(FS.contains))
                .forEachRemaining(stmt -> stmt.getSubject().addProperty(stmt.getPredicate(), newSubject));

        subject.getModel().removeAll(subject, null, null).removeAll(null, null, subject);

        subject.addProperty(FS.movedTo, newSubject);
    }

    private static Resource copyVersion(Resource ver) {
        var newVer = ver.getModel().createResource();
        copyProperties(ver.asResource(), newVer, RDF.type, FS.dateModified, FS.deletedBy, FS.fileSize, FS.blobId, FS.md5);
        return newVer;
    }

    @Override
    public void copyTo(io.milton.resource.CollectionResource toCollection, String name) throws NotAuthorizedException, BadRequestException, ConflictException {
        var existing = toCollection.child(name);
        if (existing != null) {
            throw new ConflictException(existing);
        }
        copy(subject, ((DirectoryResource) toCollection).subject, name, currentUserResource(), timestampLiteral());
    }

    private void copy(org.apache.jena.rdf.model.Resource subject, org.apache.jena.rdf.model.Resource parent, String name, org.apache.jena.rdf.model.Resource user, Literal date) {
        var newSubject = childSubject(parent, name);
        newSubject.removeProperties();
        parent.addProperty(FS.contains, newSubject);
        newSubject.addProperty(RDFS.label, name)
                .addProperty(FS.dateCreated, date)
                .addProperty(FS.createdBy, user);

        copyProperties(subject, newSubject, RDF.type, FS.contentType);

        if (subject.hasProperty(FS.versions)) {
            var src = getListProperty(subject, FS.versions).getHead().asResource();

            var ver = newSubject.getModel().createResource()
                    .addProperty(RDF.type, FS.FileVersion)
                    .addProperty(FS.modifiedBy, user)
                    .addProperty(FS.dateModified, date);

            copyProperties(src, ver, FS.blobId, FS.fileSize, FS.md5);

            newSubject.addLiteral(FS.currentVersion, 1)
                    .addProperty(FS.versions, newSubject.getModel().createList(ver));
        }
        getResourceProperties(subject, FS.contains)
                .forEach(r -> copy(r, newSubject, getStringProperty(r, RDFS.label), user, date));
    }

    @Override
    public Object getProperty(QName name) {
        if (name.equals(IRI_PROPERTY)) {
            return subject.getURI();
        }
        if (name.equals(DATE_DELETED_PROPERTY)) {
            return parseDate(subject, FS.dateDeleted);
        }
        return false;
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySource.PropertySetException, NotAuthorizedException {
        // TODO: Remove
        if (name.equals(DATE_DELETED_PROPERTY) && value == null && subject.hasProperty(FS.dateDeleted)) {
            try {
                restore();
            } catch (BadRequestException e) {
                throw new PropertySource.PropertySetException(Response.Status.SC_BAD_REQUEST, e.getReason());
            } catch (ConflictException e) {
                throw new PropertySource.PropertySetException(Response.Status.SC_CONFLICT, e.getMessage());
            }
        }
    }

    private void restore(org.apache.jena.rdf.model.Resource resource, Literal date, org.apache.jena.rdf.model.Resource user) {
        if (resource.hasProperty(FS.deletedBy, user) && resource.hasProperty(FS.dateDeleted, date)) {
            resource.removeAll(FS.dateDeleted).removeAll(FS.deletedBy);

            resource.listProperties(FS.contains)
                    .forEachRemaining(statement -> restore(statement.getResource(), date, user));
        }
    }

    @Override
    public PropertySource.PropertyMetaData getPropertyMetaData(QName name) {
        if (name.equals(IRI_PROPERTY)) {
            return IRI_PROPERTY_META;
        }
        if (name.equals(IS_READONLY_PROPERTY)) {
            return IS_READONLY_PROPERTY_META;
        }
        if (name.equals(DATE_DELETED_PROPERTY)) {
            return DATE_DELETED_PROPERTY_META;
        }
        return null;
    }

    @Override
    public boolean isCompatible(Request.Method m) {
        return !m.isWrite || (!subject.hasProperty(FS.dateDeleted) || m == Request.Method.PROPPATCH || m == Request.Method.DELETE);
    }

    @Override
    public String toString() {
        return subject.getURI().substring(factory.rootSubject.getURI().length());
    }

    protected org.apache.jena.rdf.model.Resource newVersion() {
        var blob = getBlob();

        return subject.getModel()
                .createResource()
                .addProperty(RDF.type, FS.FileVersion)
                .addProperty(FS.blobId, blob.id)
                .addLiteral(FS.fileSize, blob.size)
                .addProperty(FS.md5, blob.md5)
                .addProperty(FS.dateModified, timestampLiteral())
                .addProperty(FS.modifiedBy, currentUserResource());
    }

    protected static Date parseDate(org.apache.jena.rdf.model.Resource s, org.apache.jena.rdf.model.Property p) {
        if (!s.hasProperty(p)) {
            return null;
        }
        return Date.from(parseXSDDateTimeLiteral(s.getProperty(p).getLiteral()));
    }

    @Override
    public String processForm(Map<String, String> parameters, Map<String, FileItem> files) throws BadRequestException, NotAuthorizedException, ConflictException {
        var action = parameters.get("action");
        if (action == null) {
            throw new BadRequestException(this, "No action specified");
        }
        performAction(action, parameters, files);
        return null;
    }

    protected void performAction(String action, Map<String, String> parameters, Map<String, FileItem> files)  throws BadRequestException, NotAuthorizedException, ConflictException {
        switch (action) {
            case "restore" -> restore();
            default -> throw new BadRequestException(this, "Unrecognized action " + action);
        }
    }

    private void restore() throws BadRequestException, NotAuthorizedException, ConflictException {
        if (!subject.hasProperty(FS.dateDeleted)) {
            throw new ConflictException(this, "Cannot restore");
        }
        var date = subject.getProperty(FS.dateDeleted).getLiteral();
        var user = subject.getProperty(FS.deletedBy).getResource();
        restore(subject, date, user);
    }
}
