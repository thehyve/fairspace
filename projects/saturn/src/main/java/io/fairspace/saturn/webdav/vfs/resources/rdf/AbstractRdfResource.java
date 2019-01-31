package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsUser;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.GregorianCalendar;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CREATOR;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.SCHEMA_IDENTIFIER;

@Getter
@EqualsAndHashCode
@Slf4j
public abstract class AbstractRdfResource implements VfsResource {
    private String uniqueId;
    private String name;
    private String path;
    private Instant createdDate;
    private Instant modifiedDate;
    private VfsUser creator = null;

    /**
     * Instantiates a resource object by reading values from the RDF model
     *
     * Please note that if multiple triples exist for the same property, the behaviour is undefined!
     *
     * @param rdfResource
     * @param model
     */
    public AbstractRdfResource(Resource rdfResource, Model model) {
        extractModel(rdfResource, model);
    }

    /**
     * Extracts the basic properties for a resource from the RDF model
     * @param rdfResource
     * @param model
     */
    protected void extractModel(Resource rdfResource, Model model) {
        uniqueId = rdfResource.getURI();

        RDFNode nameObject = getPropertyValueOrNull(rdfResource, model, NAME);
        name = nameObject != null ? nameObject.toString() : null;

        RDFNode pathObject = getPropertyValueOrNull(rdfResource, model, PATH);
        path = pathObject != null ? pathObject.toString() : null;

        RDFNode createdDateObject = getPropertyValueOrNull(rdfResource, model, DATE_CREATED);
        if(createdDateObject != null) {
            ZonedDateTime zonedDateTime = parseTypedDateTimeLiteral(createdDateObject.asLiteral());
            if(zonedDateTime == null) {
                log.info("Invalid datetime found in RDF datastore for date created: " + createdDateObject.toString());
                createdDate = null;
            } else {
                createdDate = zonedDateTime.toInstant();
            }
        }

        RDFNode modifiedDateObject = getPropertyValueOrNull(rdfResource, model, DATE_MODIFIED);
        if(modifiedDateObject != null) {
            ZonedDateTime zonedDateTime = parseTypedDateTimeLiteral(modifiedDateObject.asLiteral());
            if(zonedDateTime == null) {
                log.info("Invalid datetime found in RDF datastore for date modified: " + modifiedDateObject.toString());
                modifiedDate = null;
            } else {
                modifiedDate = zonedDateTime.toInstant();
            }
        }

        RDFNode creatorUriObject = getPropertyValueOrNull(rdfResource, model, CREATOR);
        if(creatorUriObject != null) {
            RDFNode creatorNameObject = getPropertyValueOrNull(creatorUriObject.asResource(), model, NAME);
            RDFNode creatorIdObject = getPropertyValueOrNull(creatorUriObject.asResource(), model, SCHEMA_IDENTIFIER);

            creator = new VfsUser(
                    creatorIdObject != null ? creatorIdObject.toString() : null,
                    creatorNameObject != null ? creatorNameObject.toString() : null
            );
        }

    }

    private ZonedDateTime parseTypedDateTimeLiteral(Literal literal) {
        if(literal == null)
            return null;

        Object value = literal.getValue();

        if(value instanceof XSDDateTime) {
            return ((GregorianCalendar) ((XSDDateTime) value).asCalendar()).toZonedDateTime();
        }

        return null;
    }


    protected static RDFNode getPropertyValueOrNull(Resource rdfResource, Model model, Property property) {
        Statement statement = model.getProperty(rdfResource, property);
        return statement != null ? statement.getObject() : null;
    }
}
