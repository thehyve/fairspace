package io.fairspace.saturn.vfs.managed;

import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.pivovarit.function.ThrowingConsumer;
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
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.AccessDeniedException;
import java.nio.file.FileAlreadyExistsException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.ModelUtils.copyProperty;
import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTimeLiteral;
import static io.fairspace.saturn.rdf.SparqlUtils.toXSDDateTimeLiteral;
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
        return dataset.calculateRead(() -> {
            var model = dataset.getDefaultModel();
            var resource = model.createResource(iri(path));
            if (model.containsResource(resource) && !resource.hasProperty(FS.dateDeleted) && !resource.hasProperty(FS.movedTo)) {
                var fileInfo = fileInfo(resource);
                var collection = collections.getByLocation(splitPath(path)[0]);
                if (collection == null) {
                    return null;
                }
                fileInfo.setReadOnly(!collection.canWrite());
                return fileInfo;
            } else {
                return null;
            }
        });
    }

    private FileInfo fileInfo(Resource resource) {
        return FileInfo.builder()
                .path(resource.getProperty(FS.filePath).getString())
                .isDirectory(resource.hasProperty(RDF.type, FS.Directory))
                .createdBy(resource.getPropertyResourceValue(FS.createdBy).asNode())
                .modifiedBy(resource.getPropertyResourceValue(FS.modifiedBy).asNode())
                .created(parseXSDDateTimeLiteral(resource.getProperty(FS.dateCreated).getLiteral()))
                .modified(parseXSDDateTimeLiteral(resource.getProperty(FS.dateModified).getLiteral()))
                .size(resource.hasProperty(FS.fileSize) ? resource.getProperty(FS.fileSize).getLong() : 0)
                .build();
    }

    @Override
    protected List<FileInfo> listCollectionOrDirectory(String path) throws IOException {
        var collectionLocation = splitPath(path)[0];
        return dataset.calculateRead(() -> {
            var collection = collections.getByLocation(collectionLocation);
            if (collection == null) {
                throw new AccessDeniedException("User has no access to collection " + collectionLocation);
            }
            var readOnly = !collection.canWrite();
            var parent = dataset.getDefaultModel().createResource(iri(path));
            return parent.listProperties(FS.contains)
                    .mapWith(Statement::getResource)
                    .filterDrop(r -> r.hasProperty(FS.dateDeleted))
                    .mapWith(this::fileInfo)
                    .mapWith(f -> {
                        f.setReadOnly(readOnly);
                        return f;
                    })
                    .toList();
        });
    }

    @Override
    protected FileInfo doMkdir(String path) throws IOException {
        return dataset.calculateWrite(() -> {
            ensureCanCreate(path);

            var resource = dataset.getDefaultModel().createResource(iri(path));

            dataset.getDefaultModel().removeAll(resource, null, null);
            dataset.getDefaultModel().removeAll(null, null, resource);

            var user = dataset.getDefaultModel().createResource(userIriSupplier.get().getURI());
            var now = toXSDDateTimeLiteral(Instant.now());

            resource.addLiteral(FS.filePath, path)
                    .addProperty(RDF.type, FS.Directory)
                    .addProperty(RDFS.label, name(path))
                    .addProperty(FS.createdBy, user)
                    .addProperty(FS.modifiedBy, user)
                    .addLiteral(FS.dateCreated, now)
                    .addLiteral(FS.dateModified, now)
                    .addLiteral(FS.fileSize, 0L);

            var parent = dataset.getDefaultModel().createResource(iri(parentPath(path)));
            dataset.getDefaultModel().add(parent, FS.contains, resource);

            return stat(path);
        });
    }

    @Override
    protected FileInfo doCreate(String path, InputStream in) throws IOException {
        var blobInfo = write(in);

        return dataset.calculateWrite(() -> {
            ensureCanCreate(path);

            var resource = dataset.getDefaultModel().createResource(iri(path));

            dataset.getDefaultModel().removeAll(resource, null, null);
            dataset.getDefaultModel().removeAll(null, null, resource);
            var user = dataset.getDefaultModel().createResource(userIriSupplier.get().getURI());
            var now = toXSDDateTimeLiteral(Instant.now());

            resource.addLiteral(FS.filePath, path)
                    .addProperty(RDF.type, FS.File)
                    .addProperty(RDFS.label, name(path))
                    .addProperty(FS.createdBy, user)
                    .addProperty(FS.modifiedBy, user)
                    .addLiteral(FS.dateCreated, now)
                    .addLiteral(FS.dateModified, now)
                    .addLiteral(FS.fileSize, blobInfo.size)
                    .addLiteral(FS.blobId, blobInfo.id)
                    .addLiteral(FS.md5, blobInfo.md5);

            var parent = dataset.getDefaultModel().createResource(iri(parentPath(path)));
            dataset.getDefaultModel().add(parent, FS.contains, resource);

            return stat(path);
        });
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        var blobInfo = write(in);

        dataset.executeWrite(() -> {
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

            var user = dataset.getDefaultModel().createResource(userIriSupplier.get().getURI());
            var now = toXSDDateTimeLiteral(Instant.now());

            dataset.getDefaultModel().createResource(iri(path))
                    .removeAll(FS.blobId)
                    .removeAll(FS.fileSize)
                    .removeAll(FS.md5)
                    .addLiteral(FS.blobId, blobInfo.id)
                    .addLiteral(FS.fileSize, blobInfo.size)
                    .addLiteral(FS.md5, blobInfo.md5)
                    .addProperty(FS.modifiedBy, user)
                    .addLiteral(FS.dateModified, now);
        });
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        var blobId = dataset.calculateRead(() ->
                dataset.getDefaultModel()
                        .createResource(iri(path))
                        .listProperties(FS.blobId)
                        .nextOptional()
                        .map(Statement::getString)
                        .orElseThrow(() -> new FileNotFoundException(path)));
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
        dataset.executeWrite(() -> {
            var info = stat(path);
            if (info == null) {
                throw new FileNotFoundException(path);
            }
            if (info.isReadOnly()) {
                throw new IOException("Cannot delete " + path);
            }

            deleteWithoutChecks(path);
        });
    }

    private void deleteWithoutChecks(String path) throws IOException {
        var resource = dataset.getDefaultModel().createResource(iri(path));
        var user = dataset.getDefaultModel().createResource(userIriSupplier.get().getURI());
        var now = toXSDDateTimeLiteral(Instant.now());
        var dir = parentPath(path);
        if (dir != null) {
            var parent = dataset.getDefaultModel().createResource(iri(dir));
            parent.getModel().removeAll(parent, FS.contains, resource);
        }
        deleteRecursively(resource, now, user);
    }

    private void deleteRecursively(Resource resource, Literal date, Resource user) {
        if (resource.hasProperty(RDF.type, FS.Directory) || resource.hasProperty(RDF.type, FS.Collection)) {
            resource.listProperties(FS.contains)
                    .mapWith(Statement::getResource)
                    .forEachRemaining(child -> deleteRecursively(child, date, user));
        }

        resource.addLiteral(FS.dateDeleted, date)
                .addProperty(FS.deletedBy, user);
    }

    @Override
    public void close() throws IOException {
    }

    @SneakyThrows
    @Subscribe
    public void onCollectionDeleted(CollectionDeletedEvent e) {
        dataset.executeWrite(() -> deleteWithoutChecks(e.getCollection().getLocation()));
    }

    @SneakyThrows
    @Subscribe
    public void onCollectionMoved(CollectionMovedEvent e) {
        dataset.executeWrite(() -> copyOrMoveNoCheck(true, e.getOldLocation(), e.getCollection().getLocation()));
    }

    private void copyOrMove(boolean move, String from, String to) throws IOException {
        if (from.equals(to) || to.startsWith(from + '/')) {
            var verb = move ? "move" : "copy";
            throw new FileAlreadyExistsException("Cannot" + verb + " a file or a directory to itself");
        }

        dataset.executeWrite(() -> {
            ensureCanCreate(to);
            var source = stat(from);
            if (source == null) {
                throw new FileNotFoundException(from);
            }
            copyOrMoveNoCheck(move, from, to);
        });
    }

    private void copyOrMoveNoCheck(boolean move, String from, String to) throws IOException {
        var src = dataset.getDefaultModel().createResource(iri(from));
        var dst = dataset.getDefaultModel().createResource(iri(to));
        var parent = dataset.getDefaultModel().createResource(iri(parentPath(to)));
        dst.removeProperties();
        dst.addProperty(FS.filePath, to);
        parent.addProperty(FS.contains, dst);

        src.listProperties(FS.contains)
                .mapWith(Statement::getResource)
                .mapWith(r -> r.getProperty(RDFS.label).getString())
                .forEachRemaining(ThrowingConsumer.sneaky(name -> copyOrMoveNoCheck(move, joinPaths(from, name), joinPaths(to, name))));

        if (move) {
            src.listProperties()
                    .filterDrop(s -> s.getPredicate().equals(FS.contains))
                    .filterDrop(s -> s.getPredicate().equals(FS.filePath))
                    .filterDrop(s -> s.getPredicate().equals(RDFS.label))
                    .forEachRemaining(s -> dst.addProperty(s.getPredicate(), s.getObject()));

            if (src.hasProperty(RDF.type, FS.Collection)) {
                copyProperty(RDFS.label, src, dst);
            } else {
                dst.addProperty(RDFS.label, name(to));
            }

            dataset.getDefaultModel()
                    .listStatements(null, null, src)
                    .filterDrop(stmt -> stmt.getPredicate().equals(FS.contains))
                    .forEachRemaining(stmt -> dataset.getDefaultModel().add(stmt.getSubject(), stmt.getPredicate(), dst));

            dataset.getDefaultModel()
                    .removeAll(null, null, src)
                    .removeAll(src, null, null)
                    .add(src, FS.movedTo, dst);
        } else {
            List.of(RDF.type, FS.blobId, FS.fileSize, FS.md5, FS.dateCreated, FS.dateModified, FS.createdBy, FS.modifiedBy)
                    .forEach(p -> copyProperty(p, src, dst));
            dst.addProperty(RDFS.label, name(to));
        }
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
