package io.fairspace.saturn.vfs.managed;

import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import io.fairspace.saturn.services.collections.CollectionDeletedEvent;
import io.fairspace.saturn.services.collections.CollectionMovedEvent;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.vfs.BaseFileSystem;
import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.SneakyThrows;
import org.apache.commons.io.input.CountingInputStream;
import org.apache.commons.io.input.MessageDigestCalculatingInputStream;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.QuerySolution;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.AccessDeniedException;
import java.nio.file.FileAlreadyExistsException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.*;
import static io.fairspace.saturn.vfs.PathUtils.*;
import static org.apache.commons.codec.binary.Hex.encodeHexString;

public class ManagedFileSystem extends BaseFileSystem {
    public static final String TYPE = "";

    private final DatasetJobSupport dataset;
    private final BlobStore store;
    private final Supplier<Node> userIriSupplier;

    public ManagedFileSystem(DatasetJobSupport dataset, BlobStore store, Supplier<Node> userIriSupplier, CollectionsService collections, EventBus eventBus) {
        super(collections);
        this.dataset = dataset;
        this.store = store;
        this.userIriSupplier = userIriSupplier;
        eventBus.register(this);
    }

    @Override
    protected FileInfo statRegularFile(String path) throws IOException {
        return selectSingle(dataset, storedQuery("fs_stat", path), this::fileInfo)
                .map(fileInfo -> {
                    var collection = collections.getByLocation(splitPath(path)[0]);
                    if (collection == null) {
                        return null;
                    }
                    fileInfo.setReadOnly(!collection.canWrite());
                    return fileInfo;
                })
                .orElse(null);
    }

    @Override
    protected List<FileInfo> listCollectionOrDirectory(String path) throws IOException {
        var collectionLocation = splitPath(path)[0];
        var collection = collections.getByLocation(collectionLocation);
        if (collection == null) {
            throw new AccessDeniedException("User has no access to collection " + collectionLocation);
        }
        var readOnly = !collection.canWrite();
        var files = select(dataset, storedQuery("fs_ls", path + '/'), this::fileInfo);
        files.forEach(f -> f.setReadOnly(readOnly));
        return files;
    }

    @Override
    protected FileInfo doMkdir(String path) throws IOException {
        return dataset.calculateWrite("Create directory " + path, () -> {
            ensureCanCreate(path);
            update(dataset, storedQuery("fs_mkdir", path, userIriSupplier.get(), name(path)));
            return stat(path);
        });
    }

    @Override
    protected FileInfo doCreate(String path, InputStream in) throws IOException {
        var blobInfo = write(in);

        return dataset.calculateWrite("Create file " + path, () -> {
            ensureCanCreate(path);
            update(dataset, storedQuery("fs_create", path, blobInfo.getSize(), blobInfo.getId(), userIriSupplier.get(), name(path), blobInfo.getMd5()));
            return stat(path);
        });
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        var blobInfo = write(in);

        dataset.executeWrite("Modify file " + path, () -> {
            var info = stat(path);
            if (info == null) {
                throw new FileNotFoundException(path);
            }
            if (info.isDirectory()) {
                throw new IOException("Expected a file: " + path);
            }
            if (info.isReadOnly()) {
                throw new IOException("File is read-only: " + path);
            }
            update(dataset, storedQuery("fs_modify", path, blobInfo.getSize(), blobInfo.getId(), userIriSupplier.get(), blobInfo.getMd5()));
        });
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        var blobId = selectSingle(dataset, storedQuery("fs_get_blobid", path),
                row -> row.getLiteral("blobId").getString())
                .orElseThrow(() -> new FileNotFoundException(path));
        store.read(blobId, out);
    }

    @Override
    protected void doCopy(String from, String to) throws IOException {
        copyOrMove(false, from, to);
    }

    @Override
    protected void doMove(String from, String to) throws IOException {
        copyOrMove(true, from, to);
    }

    @Override
    public void doDelete(String path) throws IOException {
        dataset.executeWrite("Delete " + path, () -> {
            var info = stat(path);
            if (info == null) {
                throw new FileNotFoundException(path);
            }
            if (info.isReadOnly()) {
                throw new IOException("Cannot delete " + path);
            }
            update(dataset, storedQuery("fs_delete_" + (info.isDirectory() ? "dir" : "file"), path, userIriSupplier.get()));
        });
    }

    @Override
    protected String fileOrDirectoryIri(String path) throws IOException {
        return selectSingle(dataset, storedQuery("fs_stat", path), row -> row.getResource("iri").getURI())
                .orElse(null);    
    }

    @Override
    public void close() throws IOException {
    }

    @Subscribe
    public void onCollectionDeleted(CollectionDeletedEvent e) {
        update(dataset, storedQuery("fs_delete_dir", e.getCollection().getLocation(), userIriSupplier.get()));
    }

    @Subscribe
    public void onCollectionMoved(CollectionMovedEvent e) {
        update(dataset, storedQuery("fs_move_dir", e.getOldLocation(), e.getCollection().getLocation(), e.getCollection().getName()));
    }

    private FileInfo fileInfo(QuerySolution row) {
        return FileInfo.builder()
                .path(row.getLiteral("path").getString())
                .size(row.getLiteral("size").getLong())
                .isDirectory(row.getLiteral("isDirectory").getBoolean())
                .created(parseXSDDateTimeLiteral(row.getLiteral("created")))
                .modified(parseXSDDateTimeLiteral(row.getLiteral("modified")))
                .createdBy(row.getResource("createdBy").asNode())
                .modifiedBy(row.getResource("modifiedBy").asNode())
                .customProperties(generateCustomProperties(row))
                .build();
    }

    private Map<String, String> generateCustomProperties(QuerySolution row) {
        var properties = new HashMap<String, String>();

        properties.put(FS.CREATED_BY_LOCAL_PART, row.getLiteral("createdByName").getString());
        properties.put(FS.MODIFIED_BY_LOCAL_PART, row.getLiteral("modifiedByName").getString());

        if(row.getLiteral("md5") != null) {
            properties.put(FS.CHECKSUM_LOCAL_PART, row.getLiteral("md5").getString());
        }

        return properties;
    }

    private void copyOrMove(boolean move, String from, String to) throws IOException {
        var verb = move ? "move" : "copy";

        if (from.equals(to) || to.startsWith(from + '/')) {
            throw new FileAlreadyExistsException("Cannot" + verb + " a file or a directory to itself");
        }
        dataset.executeWrite(verb + " data from " + from + " to " + to, () -> {
            ensureCanCreate(to);
            var typeSuffix = stat(from).isDirectory() ? "_dir" : "_file";
            update(dataset, storedQuery("fs_" + verb + typeSuffix, from, to, name(to)));
        });
    }

    private void ensureCanCreate(String path) throws IOException {
        if (exists(path)) {
            throw new FileAlreadyExistsException(path);
        }
        if (stat(parentPath(path)).isReadOnly()) {
            throw new IOException("Target path is read-only");
        }
    }

    @SneakyThrows(NoSuchAlgorithmException.class)
    private BlobInfo write(InputStream in) throws IOException {
        var countingInputStream = new CountingInputStream(in);
        var messageDigestCalculatingInputStream = new MessageDigestCalculatingInputStream(countingInputStream);

        var id = store.write(messageDigestCalculatingInputStream);

        return new BlobInfo(id, countingInputStream.getByteCount(), encodeHexString(messageDigestCalculatingInputStream.getMessageDigest().digest()));
    }

    @Getter
    @AllArgsConstructor
    private static class BlobInfo {
        private final String id;
        private final long size;
        private final String md5;
    }
}
