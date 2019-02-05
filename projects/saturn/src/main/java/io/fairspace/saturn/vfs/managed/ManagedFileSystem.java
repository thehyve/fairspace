package io.fairspace.saturn.vfs.managed;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.util.Ref;
import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.commons.io.input.CountingInputStream;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdfconnection.RDFConnection;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.StoredQueries.storedQuery;
import static io.fairspace.saturn.vfs.PathUtils.splitPath;

public class ManagedFileSystem implements VirtualFileSystem {



    private final RDFConnection rdf;
    private final BlobStore store;
    private final String baseUri;
    private final Supplier<UserInfo> userInfoSupplier;

    public ManagedFileSystem(RDFConnection rdf, BlobStore store, String baseUri, Supplier<UserInfo> userInfoSupplier) {
        this.rdf = rdf;
        this.store = store;
        this.baseUri = baseUri;
        this.userInfoSupplier = userInfoSupplier;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        if (path.isEmpty()) {
            return FileInfo.builder().path("")
                    .isReadable(true)
                    .isWriteable(true)
                    .isDirectory(true)
                    .build();
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

    @Override
    public void mkdir(String path) throws IOException {
        var topLevel = splitPath(path).length == 1;
        withCommitMessage("Create directory " + path,
                () -> rdf.update(storedQuery("fs_mkdir", baseUri, topLevel ? FS.Collection : FS.Directory, path, userId())));
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        if (splitPath(path).length == 1) {
            throw new IOException("Cannot create a file in a top level directory");
        }
        var cis = new CountingInputStream(in);
        var blobId = store.write(cis);
        withCommitMessage("Create file " + path, () ->
                rdf.update(storedQuery("fs_create", baseUri, path, cis.getByteCount(), blobId, userId())));
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
                () -> rdf.update(storedQuery("fs_copy", from, to, baseUri)));
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

    private static FileInfo fileInfo(QuerySolution row) {
        return FileInfo.builder()
                .path(row.getLiteral("path").getString())
                .size(row.getLiteral("size").getLong())
                .isDirectory(!row.getResource("type").equals(FS.File))
                .created(parseXSDDateTime(row.getLiteral("created")))
                .modified(parseXSDDateTime(row.getLiteral("modified")))
                .creator(row.getLiteral("creator").getString())
                .isReadable(true) // TODO: check
                .isWriteable(true) // TODO: check
                .build();
    }

    private String userId() {
        if (userInfoSupplier != null) {
            var userInfo = userInfoSupplier.get();
            return userInfo != null ? userInfo.getUserId() : "";
        }
        return "";
    }

    private static long parseXSDDateTime(Literal literal) {
        return ((XSDDateTime)literal.getValue()).asCalendar().getTimeInMillis();
    }
}
