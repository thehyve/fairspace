package io.fairspace.saturn.vfs.managed;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.util.Ref;
import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import org.apache.commons.io.input.CountingInputStream;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTime;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.vfs.PathUtils.splitPath;
import static java.util.stream.Collectors.toList;

public class ManagedFileSystem implements VirtualFileSystem {
    private static final FileInfo ROOT = FileInfo.builder().path("")
            .readOnly(false)
            .isDirectory(true)
            .build();
    private final RDFConnection rdf;
    private final BlobStore store;
    private final Supplier<UserInfo> userInfoSupplier;
    private final CollectionsService collections;

    public ManagedFileSystem(RDFConnection rdf, BlobStore store, Supplier<UserInfo> userInfoSupplier, CollectionsService collections) {
        this.rdf = rdf;
        this.store = store;
        this.userInfoSupplier = userInfoSupplier;
        this.collections = collections;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        if (path.isEmpty()) {
            return ROOT;
        }

        if (isCollection(path)) {
            var collection = collections.getByDirectoryName(path);
            if (collection == null) {
                return null;
            }
            return fileInfo(collection);
        }

        var info = new Ref<FileInfo>();

        rdf.querySelect(storedQuery("fs_stat", path),
                row -> info.value = fileInfo(row));

        return info.value;
    }

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        if (parentPath.isEmpty()) {
            return collections.list()
                    .stream()
                    .map(ManagedFileSystem::fileInfo)
                    .collect(toList());
        }

        var list = new ArrayList<FileInfo>();
        rdf.querySelect(storedQuery("fs_ls", parentPath + '/'),
                row -> list.add(fileInfo(row)));
        return list;
    }

    @Override
    public void mkdir(String path) throws IOException {
        withCommitMessage("Create directory " + path,
                () -> rdf.update(storedQuery("fs_mkdir", path, userId())));
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        if (splitPath(path).length == 1) {
            throw new IOException("Cannot create a file in a top level directory");
        }
        var cis = new CountingInputStream(in);
        var blobId = store.write(cis);
        withCommitMessage("Create file " + path, () ->
                rdf.update(storedQuery("fs_create", path, cis.getByteCount(), blobId, userId())));
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        var cis = new CountingInputStream(in);
        var blobId = store.write(cis);
        withCommitMessage("Modify file " + path,
                () -> rdf.update(storedQuery("fs_modify", path, cis.getByteCount(), blobId, userId())));
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
        ensureNotACollection(from);
        ensureNotACollection(to);
        withCommitMessage("Copy data from " + from + " to " + to,
                () -> rdf.update(storedQuery("fs_copy", from, to)));
    }

    @Override
    public void move(String from, String to) throws IOException {
        ensureNotACollection(from);
        ensureNotACollection(to);
        withCommitMessage("Move data from " + from + " to " + to,
                () -> rdf.update(storedQuery("fs_move", from, to)));
    }

    @Override
    public void delete(String path) throws IOException {
        ensureNotACollection(path);

        withCommitMessage("Delete " + path,
                () -> rdf.update(storedQuery("fs_delete", path, userId())));
    }

    @Override
    public void close() throws IOException {

    }

    private static FileInfo fileInfo(QuerySolution row) {
        return FileInfo.builder()
                .path(row.getLiteral("path").getString())
                .size(row.getLiteral("size").getLong())
                .isDirectory(!row.getLiteral("isDirectory").getBoolean())
                .created(parseXSDDateTime(row.getLiteral("created")))
                .modified(parseXSDDateTime(row.getLiteral("modified")))
                .createdBy(row.getLiteral("createdBy").getString())
                .modifiedBy(row.getLiteral("modifiedBy").getString())
                .readOnly(false) // TODO: check
                .build();
    }

    private static FileInfo fileInfo(Collection collection) {
        return FileInfo.builder()
                .path(collection.getDirectoryName())
                .size(0)
                .isDirectory(true)
                .created(collection.getDateCreated().toEpochMilli())
                .modified(collection.getDateCreated().toEpochMilli())
                .createdBy(collection.getCreator())
                .modifiedBy(collection.getCreator())
                .readOnly(false) // TODO: check
                .build();
    }

    private String userId() {
        if (userInfoSupplier != null) {
            var userInfo = userInfoSupplier.get();
            return userInfo != null ? userInfo.getUserId() : "";
        }
        return "";
    }

    private static boolean isCollection(String path) {
        return splitPath(path).length == 1;
    }

    private static void ensureNotACollection(String path) throws IOException {
        if (isCollection(path)) {
            throw new IOException("Use Collections API for operations on collections");
        }
    }
}
