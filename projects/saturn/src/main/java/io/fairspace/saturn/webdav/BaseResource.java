package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.ConditionalCompatibleResource;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.webdav.WebDavProtocol;
import io.milton.property.PropertySource;
import io.milton.resource.*;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.*;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import javax.xml.namespace.QName;
import java.util.Date;
import java.util.List;

import static io.fairspace.saturn.auth.RequestContext.getCurrentUser;
import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTimeLiteral;
import static io.fairspace.saturn.webdav.PathUtils.joinPaths;
import static io.fairspace.saturn.webdav.WebDAVServlet.getBlob;
import static io.milton.property.PropertySource.PropertyAccessibility.READ_ONLY;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;

abstract class BaseResource implements PropFindableResource, DeletableResource, MoveableResource, CopyableResource, MultiNamespaceCustomPropertyResource, ConditionalCompatibleResource {
    protected static final QName IRI_PROPERTY = new QName(FS.NS, "iri");
    private static final PropertySource.PropertyMetaData IRI_PROPERTY_META = new PropertySource.PropertyMetaData(READ_ONLY, String.class);
    protected static final QName IS_READONLY_PROPERTY = new QName(WebDavProtocol.DAV_URI, "isreadonly");
    private static final PropertySource.PropertyMetaData IS_READONLY_PROPERTY_META = new PropertySource.PropertyMetaData(READ_ONLY, Boolean.class);
    protected static final QName DATE_DELETED_PROPERTY = new QName(FS.NS, "dateDeleted");
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
        return (method.isWrite ? access.canWrite() : access.canRead()) || getCurrentUser().isAdmin();
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
            subject.addProperty(FS.dateDeleted, DavFactory.now())
                    .addProperty(FS.deletedBy, DavFactory.getUser());
        }
    }

    @Override
    public void moveTo(io.milton.resource.CollectionResource rDest, String name) throws ConflictException, NotAuthorizedException, BadRequestException {
        var existing = rDest.child(name);
        if (existing != null) {
            throw new ConflictException(existing);
        }
        move(subject, ((DirectoryResource) rDest).subject, name);
    }

    private void move(org.apache.jena.rdf.model.Resource subject, org.apache.jena.rdf.model.Resource parent, String name) {
        var path = joinPaths(parent.getRequiredProperty(FS.filePath).getString(), name);
        var newSubject = factory.pathToSubject(path);
        newSubject.removeProperties();
        parent.addProperty(FS.contains, newSubject);
        newSubject.addProperty(FS.filePath, path)
                .addProperty(RDFS.label, name);
        subject.listProperties()
                .filterDrop(stmt -> stmt.getPredicate().equals(RDFS.label))
                .filterDrop(stmt -> stmt.getPredicate().equals(FS.filePath))
                .filterDrop(stmt -> stmt.getPredicate().equals(FS.contains))
                .forEachRemaining(stmt -> newSubject.addProperty(stmt.getPredicate(), stmt.getObject()));

        subject.listProperties(FS.contains)
                .mapWith(Statement::getObject)
                .mapWith(RDFNode::asResource)
                .forEachRemaining(r -> move(r, newSubject, r.getProperty(RDFS.label).getString()));

        subject.getModel().listStatements(null, null, subject)
                .filterDrop(stmt -> stmt.getPredicate().equals(FS.contains))
                .forEachRemaining(stmt -> factory.model.add(stmt.getSubject(), stmt.getPredicate(), newSubject));

        subject.getModel().removeAll(subject, null, null).removeAll(null, null, subject);
    }

    @Override
    public void copyTo(io.milton.resource.CollectionResource toCollection, String name) throws NotAuthorizedException, BadRequestException, ConflictException {
        var existing = toCollection.child(name);
        if (existing != null) {
            throw new ConflictException(existing);
        }
        copy(subject, ((DirectoryResource) toCollection).subject, name, DavFactory.getUser(), DavFactory.now());
    }

    private void copy(org.apache.jena.rdf.model.Resource subject, org.apache.jena.rdf.model.Resource parent, String name, org.apache.jena.rdf.model.Resource user, Literal date) {
        var path = joinPaths(parent.getRequiredProperty(FS.filePath).getString(), name);
        var newSubject = factory.pathToSubject(path);
        newSubject.removeProperties();
        parent.addProperty(FS.contains, newSubject);
        newSubject.addProperty(FS.filePath, path)
                .addProperty(RDFS.label, name);

        copyProperties(subject, newSubject, FS.blobId, FS.fileSize, FS.contentType, FS.md5, RDF.type);

        newSubject.addProperty(RDFS.label, name)
                .addProperty(FS.dateCreated, date)
                .addProperty(FS.dateModified, date)
                .addProperty(FS.createdBy, user)
                .addProperty(FS.modifiedBy, user);

        subject.listProperties(FS.contains)
                .mapWith(Statement::getObject)
                .mapWith(RDFNode::asResource)
                .forEachRemaining(r -> copy(r, newSubject, r.getProperty(RDFS.label).getString(), user, date));
    }

    protected void copyProperties(org.apache.jena.rdf.model.Resource from, org.apache.jena.rdf.model.Resource to, Property... props) {
        for (var p: props) {
            from.listProperties(p).forEachRemaining(s -> to.addProperty(p, s.getObject()));
        }
    }

    @Override
    public Object getProperty(QName name) {
        if (name.equals(IRI_PROPERTY)) {
            return subject.getURI();
        }
        if (name.equals(DATE_DELETED_PROPERTY)) {
            return parseDate(subject, FS.dateDeleted);
        }
        return null;
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySource.PropertySetException, NotAuthorizedException {
        if (name.equals(DATE_DELETED_PROPERTY) && value == null && subject.hasProperty(FS.dateDeleted)) {
                var date = subject.getProperty(FS.dateDeleted).getLiteral();
                var user = subject.getProperty(FS.deletedBy).getResource();

                restore(subject, date, user);
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
    public List<QName> getAllPropertyNames() {
        return List.of(IRI_PROPERTY, IS_READONLY_PROPERTY, DATE_DELETED_PROPERTY);
    }

    @Override
    public boolean isCompatible(Request.Method m) {
        return true;
    }

    @Override
    public String toString() {
        return "/" + subject.getURI().substring(factory.baseUri.length());
    }

    protected org.apache.jena.rdf.model.Resource newVersion() {
        var blob = getBlob();

        return subject.getModel()
                .createResource()
                .addProperty(RDF.type, FS.FileVersion)
                .addProperty(FS.blobId, blob.id)
                .addLiteral(FS.fileSize, blob.size)
                .addProperty(FS.md5, blob.md5)
                .addProperty(FS.dateModified, DavFactory.now())
                .addProperty(FS.modifiedBy, DavFactory.getUser());
    }

    protected static Date parseDate(org.apache.jena.rdf.model.Resource s, org.apache.jena.rdf.model.Property p) {
        if (!s.hasProperty(p)) {
            return null;
        }
        return Date.from(parseXSDDateTimeLiteral(s.getProperty(p).getLiteral()));
    }
}
