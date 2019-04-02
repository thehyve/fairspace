package io.fairspace.saturn.vfs.managed;

import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionDeletedEvent;
import io.fairspace.saturn.services.collections.CollectionMovedEvent;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import lombok.SneakyThrows;
import lombok.Value;
import org.apache.commons.io.input.CountingInputStream;
import org.apache.commons.io.input.MessageDigestCalculatingInputStream;
import org.apache.jena.graph.Node;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.AccessDeniedException;
import java.nio.file.FileAlreadyExistsException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.Objects;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTimeLiteral;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.vfs.PathUtils.*;
import static java.time.Instant.ofEpochMilli;
import static java.util.Optional.ofNullable;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.codec.binary.Hex.encodeHexString;

public class ManagedFileSystem implements VirtualFileSystem {
    private static final FileInfo ROOT = FileInfo.builder().path("")
            .readOnly(false)
            .isDirectory(true)
            .created(ofEpochMilli(0))
            .modified(ofEpochMilli(0))
            .build();
    private final RDFConnection rdf;
    private final BlobStore store;
    private final Supplier<Node> userIriSupplier;
    private final CollectionsService collections;
    private final PermissionsService permissions;

    public ManagedFileSystem(RDFConnection rdf, BlobStore store, Supplier<Node> userIriSupplier, CollectionsService collections, EventBus eventBus, PermissionsService permissions) {
        this.rdf = rdf;
        this.store = store;
        this.userIriSupplier = userIriSupplier;
        this.collections = collections;
        this.permissions = permissions;
        eventBus.register(this);
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        var normalizedPath = normalizePath(path);

        if (normalizedPath.isEmpty()) {
            return ROOT;
        }

        if (isCollection(normalizedPath)) {
            return ofNullable(collections.getByLocation(normalizedPath))
                    .map(ManagedFileSystem::fileInfo)
                    .orElse(null);
        }

        var processor = new QuerySolutionProcessor<>(this::fileInfo);
        rdf.querySelect(storedQuery("fs_stat", normalizedPath), processor);
        return processor.getSingle().orElse(null);
    }

    @Override
    public List<FileInfo> list(String path) throws IOException {
        var normalizedPath = normalizePath(path);

        if (normalizedPath.isEmpty()) {
            return collections.list()
                    .stream()
                    .map(ManagedFileSystem::fileInfo)
                    .collect(toList());
        }

        var processor = new QuerySolutionProcessor<>(this::fileInfo);
        rdf.querySelect(storedQuery("fs_ls", normalizedPath + '/'), processor);
        return processor.getValues()
                .stream()
                .filter(Objects::nonNull)
                .collect(toList());
    }

    @Override
    public void mkdir(String path) throws IOException {
        var normalizedPath = normalizePath(path);
        ensureValidPath(normalizedPath);

        commit("Create directory " + normalizedPath, rdf, () -> {
            ensureCanCreate(normalizedPath);
            rdf.update(storedQuery("fs_mkdir", normalizedPath, userIriSupplier.get(), name(normalizedPath)));
        });
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        var normalizedPath = normalizePath(path);
        ensureValidPath(normalizedPath);

        var blobInfo = write(in);

        commit("Create file " + normalizedPath, rdf, () -> {
            ensureCanCreate(normalizedPath);
            rdf.update(storedQuery("fs_create", normalizedPath, blobInfo.getSize(), blobInfo.getId(), userIriSupplier.get(), name(normalizedPath), blobInfo.getMd5()));
        });
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        var blobInfo = write(in);

        var normalizedPath = normalizePath(path);

        commit("Modify file " + path, rdf, () -> {
            var info = stat(normalizedPath);
            if (info == null) {
                throw new FileNotFoundException(normalizedPath);
            }
            if (info.isDirectory()) {
                throw new IOException("Expected a file: " + normalizedPath);
            }
            if (info.isReadOnly()) {
                throw new IOException("File is read-only: " + normalizedPath);
            }
            rdf.update(storedQuery("fs_modify", normalizedPath, blobInfo.getSize(), blobInfo.getId(), userIriSupplier.get(), blobInfo.getMd5()));
        });
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        var normalizedPath = normalizePath(path);
        var processor = new QuerySolutionProcessor<>(row -> row.getLiteral("blobId").getString());
        rdf.querySelect(storedQuery("fs_get_blobid", normalizedPath), processor);
        var blobId = processor.getSingle().orElseThrow(() -> new FileNotFoundException(normalizedPath));
        store.read(blobId, out);
    }

    @Override
    public void copy(String from, String to) throws IOException {
        copyOrMove(false, from, to);
    }

    @Override
    public void move(String from, String to) throws IOException {
        copyOrMove(true, from, to);
    }

    @Override
    public void delete(String path) throws IOException {
        var normalizedPath = normalizePath(path);
        ensureValidPath(normalizedPath);

        commit("Delete " + normalizedPath, rdf, () -> {
            var info = stat(normalizedPath);
            if (info == null) {
                throw new FileNotFoundException(normalizedPath);
            }
            if (info.isReadOnly()) {
                throw new IOException("Cannot delete " + normalizedPath);
            }
            rdf.update(storedQuery("fs_delete", normalizedPath, userIriSupplier.get()));
        });
    }

    @Override
    public void close() throws IOException {

    }

    @Subscribe
    public void onCollectionDeleted(CollectionDeletedEvent e) {
        rdf.update(storedQuery("fs_delete", e.getCollection().getLocation(), userIriSupplier.get()));
    }

    @Subscribe
    public void onCollectionMoved(CollectionMovedEvent e) {
        rdf.update(storedQuery("fs_move", e.getOldLocation(), e.getCollection().getLocation(), e.getCollection().getName()));
    }

    private FileInfo fileInfo(QuerySolution row) {
        var iri = row.getResource("iri");
        var access = permissions.getPermission(iri.asNode());
        if (access == Access.None) {
            return null;
        }
        return FileInfo.builder()
                .iri(iri.getURI())
                .path(row.getLiteral("path").getString())
                .size(row.getLiteral("size").getLong())
                .isDirectory(!row.getLiteral("isDirectory").getBoolean())
                .created(parseXSDDateTimeLiteral(row.getLiteral("created")))
                .modified(parseXSDDateTimeLiteral(row.getLiteral("modified")))
                .readOnly(!access.canWrite())
                .build();
    }

    private static FileInfo fileInfo(Collection collection) {
        return FileInfo.builder()
                .iri(collection.getIri().getURI())
                .path(collection.getLocation())
                .size(0)
                .isDirectory(true)
                .created(collection.getDateCreated())
                .modified(collection.getDateCreated())
                .readOnly(!collection.getAccess().canWrite())
                .build();
    }

    static boolean isCollection(String path) {
        return !path.isEmpty() && splitPath(path).length == 1;
    }

    private void copyOrMove(boolean move, String from, String to) throws IOException {
        var verb = move ? "move" : "copy";
        var normalizedFrom = normalizePath(from);
        var normalizedTo = normalizePath(to);
        ensureValidPath(normalizedFrom);
        ensureValidPath(normalizedTo);
        if (normalizedFrom.equals(normalizedTo) || normalizedTo.startsWith(normalizedFrom + '/')) {
            throw new FileAlreadyExistsException("Cannot" + verb + " a file or a directory to itself");
        }
        commit(verb + " data from " + normalizedFrom + " to " + normalizedTo, rdf, () -> {
            ensureCanCreate(normalizedTo);
            rdf.update(storedQuery("fs_" + verb, normalizedFrom, normalizedTo, name(normalizedTo)));
        });
    }

    private void ensureCanCreate(String normalizedPath) throws IOException {
        if (exists(normalizedPath)) {
            throw new FileAlreadyExistsException(normalizedPath);
        }
        if (stat(parentPath(normalizedPath)).isReadOnly()) {
            throw new IOException("Target path is read-only");
        }
    }

    private static void ensureValidPath(String path) throws IOException {
        if (!path.equals(normalizePath(path))) {
            throw new AssertionError("Invalid path format: " + path);
        }
        if (path.isEmpty()) {
            throw new AccessDeniedException("File operations on the root directory are not allowed");
        }
        if (isCollection(path)) {
            throw new AccessDeniedException("Use Collections API for operations on collections");
        }
    }

    @SneakyThrows(NoSuchAlgorithmException.class)
    private BlobInfo write(InputStream in) throws IOException {
        var countingInputStream = new CountingInputStream(in);
        var messageDigestCalculatingInputStream = new MessageDigestCalculatingInputStream(countingInputStream);

        var id = store.write(messageDigestCalculatingInputStream);

        return new BlobInfo(id, countingInputStream.getByteCount(), encodeHexString(messageDigestCalculatingInputStream.getMessageDigest().digest()));
    }

    @Value
    private static class BlobInfo {
        String id;
        long size;
        String md5;
    }
}
