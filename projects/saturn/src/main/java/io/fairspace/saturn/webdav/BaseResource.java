package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.FileItem;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.property.PropertySource;
import io.milton.property.PropertySource.PropertyMetaData;
import io.milton.property.PropertySource.PropertySetException;
import io.milton.resource.*;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import javax.xml.namespace.QName;
import java.lang.reflect.InvocationTargetException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static io.fairspace.saturn.rdf.ModelUtils.*;
import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTimeLiteral;
import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.WebDAVServlet.getBlob;
import static io.fairspace.saturn.webdav.WebDAVServlet.timestampLiteral;
import static io.milton.property.PropertySource.PropertyAccessibility.READ_ONLY;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.beanutils.PropertyUtils.getPropertyDescriptor;
import static org.apache.commons.beanutils.PropertyUtils.getPropertyDescriptors;

abstract class BaseResource implements PropFindableResource, DeletableResource, MoveableResource, CopyableResource, MultiNamespaceCustomPropertyResource, PostableResource {
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
        // for POST requests performAction *must* implement action-specific checks and throw NotAuthorizedException if necessary

        return (!method.isWrite && access.canList()) || (method.isWrite && access.canWrite());
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
            if(!factory.userService.currentUser().isAdmin()) {
                throw new NotAuthorizedException();
            }
            subject.getModel().removeAll(subject, null, null).removeAll(null, null, subject);
        } else if (!subject.hasProperty(FS.dateDeleted)) {
            subject.addProperty(FS.dateDeleted, timestampLiteral())
                    .addProperty(FS.deletedBy, factory.currentUserResource());
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
        copy(subject, ((DirectoryResource) toCollection).subject, name, factory.currentUserResource(), timestampLiteral());
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
    public List<QName> getAllPropertyNames() {
        return Stream.of(getPropertyDescriptors(getClass()))
                .filter(p -> p.getReadMethod().isAnnotationPresent(Property.class))
                .map(p -> new QName(FS.NS, p.getName()))
                .collect(toList());
    }

    @Override
    public Object getProperty(QName name) {
        try {
            return getPropertyDescriptor(this, name.getLocalPart())
                    .getReadMethod()
                    .invoke(this);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySetException, NotAuthorizedException {
        try {
            getPropertyDescriptor(this, name.getLocalPart())
                    .getWriteMethod()
                    .invoke(this, value);
        } catch (IllegalAccessException | NoSuchMethodException e) {
            throw new RuntimeException(e);
        } catch (InvocationTargetException e) {
            if (e.getTargetException() instanceof PropertySetException) {
                throw (PropertySetException) e.getTargetException();
            }
            if (e.getTargetException() instanceof NotAuthorizedException) {
                throw (NotAuthorizedException) e.getTargetException();
            }
            throw new RuntimeException(e);
        }
    }

    @Override
    public PropertySource.PropertyMetaData getPropertyMetaData(QName name) {
        try {
            var pd = getPropertyDescriptor(this, name.getLocalPart());
            if (pd != null) {
                return new PropertyMetaData(pd.getWriteMethod() != null ? WRITABLE : READ_ONLY, pd.getPropertyType());
            }
        } catch (Exception ignore) {
        }
        return null;
    }

    @Property
    public String getIri() {
        return subject.getURI();
    }

    @Property
    public Date getDateDeleted() {
        return parseDate(subject, FS.dateDeleted);
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
                .addProperty(FS.modifiedBy, factory.currentUserResource());
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

    protected void performAction(String action, Map<String, String> parameters, Map<String, FileItem> files) throws BadRequestException, NotAuthorizedException, ConflictException {
        switch (action) {
            case "undelete" -> undelete();
            default -> throw new BadRequestException(this, "Unrecognized action " + action);
        }
    }

    protected void undelete() throws BadRequestException, NotAuthorizedException, ConflictException {
        if (!access.canWrite()) {
            throw new NotAuthorizedException(this);
        }
        if (!subject.hasProperty(FS.dateDeleted)) {
            throw new ConflictException(this, "Cannot restore");
        }
        var date = subject.getProperty(FS.dateDeleted).getLiteral();
        var user = subject.getProperty(FS.deletedBy).getResource();
        undelete(subject, date, user);
    }

    private void undelete(org.apache.jena.rdf.model.Resource resource, Literal date, org.apache.jena.rdf.model.Resource user) {
        if (resource.hasProperty(FS.deletedBy, user) && resource.hasProperty(FS.dateDeleted, date)) {
            resource.removeAll(FS.dateDeleted).removeAll(FS.deletedBy);

            resource.listProperties(FS.contains)
                    .forEachRemaining(statement -> undelete(statement.getResource(), date, user));
        }
    }
}
