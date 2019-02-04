package io.fairspace.saturn.vfs.managed;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import org.apache.jena.query.ParameterizedSparqlString;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDF;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.vfs.PathUtils.splitPath;
import static java.util.UUID.randomUUID;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class ManagedFileSystem implements VirtualFileSystem {
    public static final Property COLLECTION_TYPE = createProperty("http://fairspace.io/ontology#Collection");
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
        if (path.isEmpty()) {
            return FileInfo.builder().path("").isDirectory(true).build();
        }

        var sparql = new ParameterizedSparqlString(
                "PREFIX fs: <http://fairspace.io/ontology#>\n" +
                "CONSTRUCT { ?s ?p ?o .} WHERE { ?s ?p ?o . ?s fs:filePath ?path . }");
        sparql.setIri("pathProperty", FILE_PATH_PROPERTY.getURI());
        sparql.setLiteral("path", path);
        var model = rdf.queryConstruct(sparql.toString());
        if (model.isEmpty()) {
            throw new FileNotFoundException(path);
        }
        var resource = model.listSubjects().next();
        return info(resource);
    }

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        var sparql = new ParameterizedSparqlString(
                "PREFIX fs: <http://fairspace.io/ontology#>\n" +
                        "CONSTRUCT { ?s ?p ?o .} \n" +
                        "WHERE { ?s ?p ?o ; " +
                        "fs:filePath ?path . \n " +
                        "FILTER(STRSTARTS(?path, ?pathPrefix) && !CONTAINS(SUBSTR(?path, STRLEN(?pathPrefix) + 1), '/')) }");
        sparql.setLiteral("pathPrefix", parentPath.isEmpty() ? "" : (parentPath + '/'));
        var model = rdf.queryConstruct(sparql.toString());
        var list = new ArrayList<FileInfo>();
        model.listSubjects().forEachRemaining(r -> list.add(info(r)));
        return list;
    }

    @Override
    public void mkdir(String path) throws IOException {
        withCommitMessage("Creating directory " + path, () -> {
            var topLevel = splitPath(path).length == 1;
            var resource = createResource(baseUri + randomUUID());

            var sparql = new ParameterizedSparqlString(
                    "PREFIX fs: <http://fairspace.io/ontology#>\n" +
                            "INSERT DATA { ?s a ?type ; \n" +
                            "         fs:filePath ?path .}");
            sparql.setIri("s", resource.getURI());
            sparql.setIri("type", (topLevel ? COLLECTION_TYPE : DIRECTORY_TYPE).getURI());
            sparql.setLiteral("path", path);
            rdf.update(sparql.toString());
        });
    }

    @Override
    public void write(String path, InputStream in) throws IOException {
        var id = store.write(in);
        var resource = createResource(baseUri + randomUUID());

        var sparql = new ParameterizedSparqlString(
                "PREFIX fs: <http://fairspace.io/ontology#>\n" +
                        "INSERT DATA { ?s a fs:File ; \n" +
                        "         fs:filePath ?path; \n" +
                        "         fs:blobId ?blobId}");
        sparql.setIri("s", resource.getURI());
        sparql.setLiteral("blobId", id);
        sparql.setLiteral("path", path);
        rdf.update(sparql.toString());
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        String[] blobId = { null };

        rdf.querySelect(new ParameterizedSparqlString("PREFIX fs: <http://fairspace.io/ontology#>\n" +
                "SELECT ?blobId WHERE { ?s fs:filePath ?path . ?s fs:blobId ?blobId . } ") {{
                    setLiteral("path", path);
        }}.toString(), row -> blobId[0] = row.getLiteral("blobId").getString());

        if (blobId[0] == null) {
            throw new FileNotFoundException(path);
        }

        store.read(blobId[0], out);
    }

    @Override
    public void copy(String from, String to) throws IOException {

    }

    @Override
    public void move(String from, String to) throws IOException {

    }

    @Override
    public void delete(String path) throws IOException {
        var sparql = new ParameterizedSparqlString(
                "PREFIX fs: <http://fairspace.io/ontology#>\n" +
                        "DELETE WHERE { ?s ?p ?o . ?s fs:filePath ?path . };\n" +
                        "DELETE { ?s ?p ?o } WHERE {  ?s fs:filePath ?apath . FILTER(STRSTARTS(?apath, CONCAT(?path, '/'))) };");
        sparql.setLiteral("path", path);
        rdf.update(sparql.toString());
    }

    @Override
    public void close() throws IOException {

    }

    private static FileInfo info(Resource resource) {
        return  FileInfo.builder()
                .path(resource.getProperty(FILE_PATH_PROPERTY).getString())
                .isDirectory(resource.hasProperty(RDF.type, DIRECTORY_TYPE) || resource.hasProperty(RDF.type, COLLECTION_TYPE))
                .build();
    }
}
