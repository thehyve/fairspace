package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsUser;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;

import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.IS_READY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;

@Getter
@EqualsAndHashCode
@Slf4j
public abstract class RdfAbstractResource implements VfsResource {
    private String uniqueId;
    private String name;
    private String path;
    private ZonedDateTime createdDate;
    private ZonedDateTime modifiedDate;

    // TODO: Implement creator
    private VfsUser creator = null;
    private String parentId;
    private boolean isReady;

    /**
     * Instantiates a resource object by reading values from the RDF model
     *
     * Please note that if multiple triples exist for the same property, the behaviour is undefined!
     *
     * @param rdfResource
     * @param model
     */
    public RdfAbstractResource(Resource rdfResource, Model model) {
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
        try {
            createdDate = createdDateObject != null ? ZonedDateTime.parse(createdDateObject.toString()) : null;
        } catch(DateTimeParseException e) {
            // Only log the problem, but createdDate will remain null
            log.info("Invalid datetime found in RDF datastore for date created: " + createdDateObject.toString());
        }

        RDFNode modifiedDateObject = getPropertyValueOrNull(rdfResource, model, DATE_MODIFIED);
        try {
            modifiedDate = modifiedDateObject != null ? ZonedDateTime.parse(modifiedDateObject.toString()) : null;
        } catch(DateTimeParseException e) {
            // Only log the problem, but modifiedDate will remain null
            log.info("Invalid datetime found in RDF datastore for date modified: " + modifiedDateObject.toString());
        }

        RDFNode parentObject = getPropertyValueOrNull(rdfResource, model, PARENT);
        parentId= parentObject != null ? parentObject.asResource().getURI() : null;

        RDFNode readyObject = getPropertyValueOrNull(rdfResource, model, IS_READY);
        isReady = readyObject == null ? true : !readyObject.toString().equals("false");
    }

    protected RDFNode getPropertyValueOrNull(Resource rdfResource, Model model, Property property) {
        Statement statement = model.getProperty(rdfResource, property);
        return statement != null ? statement.getObject() : null;
    }

}
