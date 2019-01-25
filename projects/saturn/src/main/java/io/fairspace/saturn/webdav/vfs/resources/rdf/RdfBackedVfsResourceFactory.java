package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_LOCATION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.FILESIZE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.IS_READY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.RDF_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_DIRECTORY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_FILE;

/**
 * @TODO Handle paths regardless of trailing slashes (suggested behavior by milton)
 */
public class RdfBackedVfsResourceFactory implements VfsResourceFactory {
    private RDFConnection connection;

    public RdfBackedVfsResourceFactory(RDFConnection connection) {
        this.connection = connection;
    }

    @Override
    public VfsResource getResource(String path) {
        // Retrieve information on the resource from the RDF store
        ParameterizedSparqlString sparql = new ParameterizedSparqlString();
        sparql.setCommandText("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?filePath ?path ; ?p ?o }");
        sparql.setIri("filePath", PATH.getURI());
        sparql.setLiteral("path", path);

        // Retrieve the data
        Model model = connection.queryConstruct(sparql.asQuery());

        // If no results are found, stop now
        if(model.isEmpty()) {
            return null;
        }

        // Retrieve the resource (iri) for the current path
        ResIterator subjectIterator = model.listSubjects();
        Resource rdfResource = subjectIterator.next();

        // Sanity check: we expect only a single subject
        if(subjectIterator.hasNext()) {
            throw new IllegalStateException("Number of metadata subjects returned for path " + path + " is larger than 1");
        }

        // Convert to the correct vfsResource
        return toVfsResource(model, rdfResource);
    }

    @Override
    public VfsDirectoryResource createCollection(String parentId, String path) {
        // Generate a new model for this collection
        // TODO: Store creator
        Model model = ModelFactory.createDefaultModel();
        Resource collection = model.createResource(generateIri(path));
        model.add(collection, RDF_TYPE, TYPE_DIRECTORY);
        model.add(collection, NAME, baseName(path));
        model.add(collection, PATH, path);
        model.add(collection, DATE_CREATED, ZonedDateTime.now().toString());
        model.add(collection, DATE_MODIFIED, ZonedDateTime.now().toString());
        model.add(collection, PARENT, model.createResource(parentId));
        model.add(collection, IS_READY, "true");

        // Store new triples in rdf store
        connection.load(model);

        return new RdfDirectoryResource(collection, model);
    }

    @Override
    public List<? extends VfsResource> getChildren(String parentId) {
        ParameterizedSparqlString sparql = new ParameterizedSparqlString();
        sparql.setCommandText("CONSTRUCT { ?s ?p ?o } WHERE { ?s ?parent ?parentId ; ?isReady ?true ; ?p ?o }");
        sparql.setIri("parent", PARENT.getURI());
        sparql.setIri("isReady", IS_READY.getURI());
        sparql.setIri("parentId", parentId);
        sparql.setLiteral("true", "true");

        // Retrieve the data
        Model model = connection.queryConstruct(sparql.asQuery());

        // If no results are found, stop now
        if(model.isEmpty()) {
            return Collections.emptyList();
        }

        // Loop through all subjects in the model and return the resource in a list
        return model.listSubjects()
                .mapWith(rdfResource -> toVfsResource(model, rdfResource))
                .toList();
    }

    @Override
    public VfsFileResource createFile(String parentId, String path, Long fileSize, String contentType) {
        // Generate a new model for this file
        // TODO Store creator
        Model model = ModelFactory.createDefaultModel();
        Resource file = model.createResource(generateIri(path));
        model.add(file, RDF_TYPE, TYPE_FILE);
        model.add(file, NAME, baseName(path));
        model.add(file, PATH, path);
        model.add(file, DATE_CREATED, ZonedDateTime.now().toString());
        model.add(file, DATE_MODIFIED, ZonedDateTime.now().toString());
        model.add(file, IS_READY, "false");
        model.add(file, PARENT, model.createResource(parentId));

        model.add(file, FILESIZE, FileSize.format(fileSize));
        model.add(file, CONTENT_TYPE, contentType);

        // Store new triples in rdf store
        connection.load(model);

        // Return the resource to be used immediately
        return new RdfFileResource(file, model);
    }

    @Override
    public VfsFileResource markFileStored(VfsFileResource fileResource, String contentLocation) {
        ParameterizedSparqlString deleteCommand = new ParameterizedSparqlString();
        deleteCommand.setCommandText("DELETE WHERE { ?subject ?dateModified ?o1 ; ?isReady ?o2 ; ?contentLocation ?o3 }");
        deleteCommand.setIri("subject", fileResource.getUniqueId());
        deleteCommand.setIri("dateModified", DATE_MODIFIED.getURI());
        deleteCommand.setIri("isReady", IS_READY.getURI());
        deleteCommand.setIri("contentLocation", CONTENT_LOCATION.getURI());

        ParameterizedSparqlString insertCommand = new ParameterizedSparqlString();
        insertCommand.setCommandText("INSERT DATA { ?subject ?dateModified ?now ; ?isReady ?true ; ?contentLocation ?location }");
        insertCommand.setIri("subject", fileResource.getUniqueId());
        insertCommand.setIri("dateModified", DATE_MODIFIED.getURI());
        insertCommand.setIri("isReady", IS_READY.getURI());
        insertCommand.setIri("contentLocation", CONTENT_LOCATION.getURI());
        insertCommand.setLiteral("now", ZonedDateTime.now().toString());
        insertCommand.setLiteral("true", "true");
        insertCommand.setLiteral("location", contentLocation);

        // Send both commands in a single transaction
        connection.update(deleteCommand.toString() + "\n;\n" + insertCommand.toString());

        // Return a full representation of the file
        return (VfsFileResource) getResource(fileResource.getPath());
    }

    private RdfAbstractResource toVfsResource(Model model, Resource rdfResource) {
        // Determine the resource type
        Statement typeTriple = model.getProperty(rdfResource, RDF_TYPE);
        if(typeTriple == null) {
            throw new IllegalStateException("No type specified for metadata entity with id " + rdfResource.toString());
        }

        if(typeTriple.getObject().equals(TYPE_DIRECTORY)) {
            return new RdfDirectoryResource(rdfResource, model);
        } else if(typeTriple.getObject().equals(TYPE_FILE)) {
            return new RdfFileResource(rdfResource, model);
        } else {
            throw new IllegalStateException("Invalid type specified for metadata entity with id " + rdfResource.toString() + ": " + typeTriple.getObject().toString());
        }
    }

    private String generateIri(String path) {
        // TODO: Improve Iri generation to be unique and deterministic
        return "http://workspace/webdav" + path;
    }

    private String baseName(String path) {
        // TODO: milton documentation suggests not to make a distinction between paths with and without trailing slash
        if (!path.contains("/") || path.endsWith("/")) {
            throw new IllegalArgumentException("Invalid path $path");
        } else {
            return path.substring(path.lastIndexOf("/") + 1);
        }
    }
}
