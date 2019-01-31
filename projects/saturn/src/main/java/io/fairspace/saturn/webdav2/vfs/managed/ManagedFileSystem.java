package io.fairspace.saturn.webdav2.vfs.managed;

import io.fairspace.saturn.webdav2.vfs.FileInfo;
import io.fairspace.saturn.webdav2.vfs.VirtualFileSystem;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDF;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import static java.util.UUID.randomUUID;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class ManagedFileSystem implements VirtualFileSystem {
    public static final Property DIRECTORY_TYPE = createProperty("http://fairspace.io/ontology#Directory");

    public static final Property FILE_PATH_PROPERTY = createProperty("http://fairspace.io/ontology#filePath");


    private final RDFConnection rdf;
    private final BlobStore store;
    private final String baseUri;

    public ManagedFileSystem(RDFConnection rdf, BlobStore store, String baseUri) {
        this.rdf = rdf;
        this.store = store;
        this.baseUri = baseUri;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        var sparql = new ParameterizedSparqlString("CONSTRUCT { ?s ?p ?o .} WHERE { ?s ?pathProperty ?path . }");
        sparql.setIri("pathProperty", FILE_PATH_PROPERTY.getURI());
        sparql.setLiteral("path", path);
        var model = rdf.queryConstruct(sparql.toString());
        if (model.isEmpty()) {
            throw new FileNotFoundException(path);
        }
        var resource = model.listSubjects().next();
        return FileInfo.builder()
                .path(path)
                .isDirectory(resource.hasProperty(RDF.type, DIRECTORY_TYPE))
                .build();
    }

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        return null;
    }

    @Override
    public void mkdir(String path) throws IOException {
        var resource = createResource(baseUri + randomUUID());
        rdf.load(createDefaultModel()
                .add(resource, RDF.type, DIRECTORY_TYPE)
                .add(resource, FILE_PATH_PROPERTY, path));
    }

    @Override
    public void write(String path, InputStream in) throws IOException {

    }

    @Override
    public void read(String path, OutputStream out) throws IOException {

    }

    @Override
    public void copy(String from, String to) throws IOException {

    }

    @Override
    public void move(String from, String to) throws IOException {

    }

    @Override
    public void delete(String path) throws IOException {

    }

    @Override
    public void close() throws IOException {

    }
}
