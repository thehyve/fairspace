package io.fairspace.saturn.vfs.managed;

import io.fairspace.saturn.util.Ref;
import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import org.apache.commons.io.input.CountingInputStream;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdfconnection.RDFConnection;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.StoredQueries.storedQuery;
import static io.fairspace.saturn.vfs.PathUtils.splitPath;
import static java.util.UUID.randomUUID;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

public class ManagedFileSystem implements VirtualFileSystem {
    public static final Property COLLECTION_TYPE = createProperty("http://fairspace.io/ontology#Collection");
    public static final Property DIRECTORY_TYPE = createProperty("http://fairspace.io/ontology#Directory");
    public static final Property FILE_TYPE = createProperty("http://fairspace.io/ontology#File");


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

        var info = new Ref<FileInfo>();

        rdf.querySelect(storedQuery("fs_stat", path),
                row -> info.value = fileInfo(row));

        return info.value;
    }

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        var list = new ArrayList<FileInfo>();
        rdf.querySelect(storedQuery("fs_ls", parentPath.isEmpty() ? "" : (parentPath + '/')),
                row -> list.add(fileInfo(row)));
        return list;
    }

    private FileInfo fileInfo(QuerySolution row) {
        return FileInfo.builder()
                .path(row.getLiteral("path").getString())
                .size(row.getLiteral("size").getLong())
                .isDirectory(!row.getResource("type").equals(FILE_TYPE))
                .build();
    }

    @Override
    public void mkdir(String path) throws IOException {
        var topLevel = splitPath(path).length == 1;
        var resource = createResource(baseUri + randomUUID());
        withCommitMessage("Create directory " + path,
                () -> rdf.update(storedQuery("fs_mkdir", resource, topLevel ? COLLECTION_TYPE : DIRECTORY_TYPE, path)));
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        var cis = new CountingInputStream(in);
        var blobId = store.write(cis);
        withCommitMessage("Create file " + path, () ->
                rdf.update(storedQuery("fs_create", createURI(baseUri + randomUUID()), path, cis.getByteCount(), blobId)));
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        var cis = new CountingInputStream(in);
        var blobId = store.write(cis);
        withCommitMessage("Modify file " + path,
                () -> rdf.update(storedQuery("fs_modify", path, cis.getByteCount(), blobId)));
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        var blobId = new Ref<String>();

        rdf.querySelect(storedQuery("fs_get_blobid", path),
                row -> blobId.value = row.getLiteral("blobId").getString());

        if (blobId.value == null) {
            throw new FileNotFoundException(path);
        }

        store.read(blobId.value, out);
    }

    @Override
    public void copy(String from, String to) throws IOException {
        withCommitMessage("Copy data from " + from + " to " + to,
                () -> rdf.update(storedQuery("fs_copy", from, to)));
    }

    @Override
    public void move(String from, String to) throws IOException {
        withCommitMessage("Move data from " + from + " to " + to,
                () -> rdf.update(storedQuery("fs_move", from, to)));
    }

    @Override
    public void delete(String path) throws IOException {
        withCommitMessage("Delete " + path,
                () -> rdf.update(storedQuery("fs_delete", path)));
    }

    @Override
    public void close() throws IOException {

    }
}
