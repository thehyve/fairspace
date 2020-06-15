package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.property.PropertySource;
import io.milton.resource.DisplayNameResource;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDFS;

import javax.xml.namespace.QName;
import java.util.List;

import static io.fairspace.saturn.auth.RequestContext.getCurrentUser;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;

class CollectionResource extends DirectoryResource implements DisplayNameResource {
    private static final QName OWNED_BY_PROPERTY = new QName(FS.ownedBy.getNameSpace(), FS.ownedBy.getLocalName());
    private static final PropertySource.PropertyMetaData OWNED_BY_PROPERTY_META = new PropertySource.PropertyMetaData(WRITABLE, String.class);
    private static final List<QName> COLLECTION_PROPERTIES = List.of(IRI_PROPERTY, IS_READONLY_PROPERTY, DATE_DELETED_PROPERTY, OWNED_BY_PROPERTY);

    public CollectionResource(DavFactory factory, Resource subject, Access access) {
        super(factory, subject, access);
    }

    @Override
    public String getName() {
        return subject.getRequiredProperty(FS.filePath).getString();
    }

    @Override
    public String getDisplayName() {
        return subject.getRequiredProperty(RDFS.label).getString();
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
        super.moveTo(rDest, name);
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
            return subject.listProperties(FS.ownedBy).nextOptional().map(Statement::getResource).map(Resource::getURI);
        }
        return super.getProperty(name);
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySource.PropertySetException, NotAuthorizedException {
        if (name.equals(OWNED_BY_PROPERTY)) {
            if (subject.hasProperty(FS.ownedBy) && !getCurrentUser().isAdmin()) {
                throw new NotAuthorizedException();
            }
            subject.removeAll(FS.ownedBy).addProperty(FS.ownedBy, subject.getModel().createResource(value.toString()));
        }
        super.setProperty(name, value);
    }

    @Override
    public PropertySource.PropertyMetaData getPropertyMetaData(QName name) {
        return super.getPropertyMetaData(name);
    }

    @Override
    public List<QName> getAllPropertyNames() {
        return COLLECTION_PROPERTIES;
    }

}