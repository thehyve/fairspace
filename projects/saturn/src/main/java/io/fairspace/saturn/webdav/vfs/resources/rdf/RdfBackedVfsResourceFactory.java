package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.RDF_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_DIRECTORY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_FILE;

public class RdfBackedVfsResourceFactory implements VfsResourceFactory {
    private Dataset dataset;

    public RdfBackedVfsResourceFactory(Dataset dataset) {
        this.dataset = dataset;
    }

    @Override
    public VfsResource getResource(String path) {
        // Retrieve information on the resource from the RDF store
        try (RDFConnection connection = RDFConnectionFactory.connect(dataset)) {
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

            // Determine the resource type
            Statement typeTriple = model.getProperty(rdfResource, RDF_TYPE);
            if(typeTriple == null) {
                throw new IllegalStateException("No type specified for metadata entity with path " + path);
            }

            if(typeTriple.getObject().equals(TYPE_DIRECTORY)) {
                return new RdfDirectoryResource(rdfResource, model);
            } else if(typeTriple.getObject().equals(TYPE_FILE)) {
                return new RdfFileResource(rdfResource, model);
            } else {
                throw new IllegalStateException("Invalid type specified for metadata entity with path " + path + ": " + typeTriple.getObject().toString());
            }
        }
    }
}
