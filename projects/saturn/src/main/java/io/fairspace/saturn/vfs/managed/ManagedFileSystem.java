package io.fairspace.saturn.vfs.managed;

import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.pivovarit.function.ThrowingConsumer;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.collections.CollectionDeletedEvent;
import io.fairspace.saturn.services.collections.CollectionMovedEvent;
import io.fairspace.saturn.services.collections.CollectionRestoredEvent;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.permissions.PermissionsService;
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

import static io.fairspace.saturn.auth.RequestContext.showDeletedFiles;
import static io.fairspace.saturn.rdf.ModelUtils.copyProperty;
import static io.fairspace.saturn.rdf.ModelUtils.getListProperty;
import static io.fairspace.saturn.rdf.SparqlUtils.*;
import static io.fairspace.saturn.vfs.PathUtils.*;
import static org.apache.commons.codec.binary.Hex.encodeHexString;

public class ManagedFileSystem extends BaseFileSystem {
    public static final String TYPE = "";

    private final Transactions transactions;
    private final BlobStore store;
    private final Supplier<Node> userIriSupplier;
    private final PermissionsService permissions;

    public ManagedFileSystem(Transactions transactions, BlobStore store, Supplier<Node> userIriSupplier,
                             CollectionsService collections, EventBus eventBus, PermissionsService permissions) {
        super(collections);
        this.transactions = transactions;
        this.store = store;
        this.userIriSupplier = userIriSupplier;
        this.permissions = permissions;
        eventBus.register(this);
    }

    @Override
    protected FileInfo statRegularFile(String path, Integer version) throws IOException {
        return transactions.calculateRead(dataset -> {
            var model = dataset.getDefaultModel();
            var resource = model.createResource(iri(path));
            if (model.containsResource(resource) && (showDeletedFiles() || !resource.hasProperty(FS.dateDeleted)) && !resource.hasProperty(FS.movedTo)) {
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

    private FileInfo fileInfo(Resource r) {
        var versions = getListProperty(r, FS.versions);

        return FileInfo.builder()
                .path(r.getProperty(FS.filePath).getString())
                .isDirectory(r.hasProperty(RDF.type, FS.Directory))
                .createdBy(r.getPropertyResourceValue(FS.createdBy).asNode())
                .modifiedBy(r.getPropertyResourceValue(FS.modifiedBy).asNode())
                .deletedBy(r.hasProperty(FS.deletedBy) ? r.getPropertyResourceValue(FS.deletedBy).asNode() : null)
                .created(parseXSDDateTimeLiteral(r.getProperty(FS.dateCreated).getLiteral()))
                .modified(parseXSDDateTimeLiteral(r.getProperty(FS.dateModified).getLiteral()))
                .deleted(r.hasProperty(FS.dateDeleted) ? parseXSDDateTimeLiteral(r.getProperty(FS.dateDeleted).getLiteral()) : null)
                .size(r.hasProperty(FS.fileSize) ? r.getProperty(FS.fileSize).getLong() : 0)
                .version(versions != null ? versions.size() + 1: 1)
                .build();
    }

    @Override
    protected List<FileInfo> listCollectionOrDirectory(String path) throws IOException {
        var collectionLocation = splitPath(path)[0];
        return transactions.calculateRead(dataset -> {
            var collection = collections.getByLocation(collectionLocation);
            if (collection == null) {
                throw new AccessDeniedException("User has no access to collection " + collectionLocation);
            }
            var readOnly = !collection.canWrite();
            var parent = dataset.getDefaultModel().createResource(iri(path));
            var showDeleted = showDeletedFiles();
            return parent.listProperties(FS.contains)
                    .mapWith(Statement::getResource)
                    .filterKeep(r -> showDeleted || !r.hasProperty(FS.dateDeleted))
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
        return transactions.calculateWrite(dataset -> {
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

        return transactions.calculateWrite(dataset -> {
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

        transactions.executeWrite(dataset -> {
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

            var file = dataset.getDefaultModel().createResource(iri(path));

            createVersion(file);

            file.removeAll(FS.blobId)
                    .removeAll(FS.fileSize)
                    .removeAll(FS.md5)
                    .removeAll(FS.modifiedBy)
                    .removeAll(FS.dateModified)
                    .addLiteral(FS.blobId, blobInfo.id)
                    .addLiteral(FS.fileSize, blobInfo.size)
                    .addLiteral(FS.md5, blobInfo.md5)
                    .addProperty(FS.modifiedBy, user)
                    .addLiteral(FS.dateModified, now);
        });
    }

    private void createVersion(Resource file) {
        var version = file.getModel().asRDFNode(generateMetadataIri()).asResource()
                .addProperty(RDF.type, FS.FileVersion)
                .addProperty(FS.blobId, file.getProperty(FS.blobId).getString())
                .addProperty(FS.md5, file.getProperty(FS.md5).getString())
                .addLiteral(FS.fileSize, file.getProperty(FS.fileSize).getLong())
                .addProperty(FS.modifiedBy, file.getPropertyResourceValue(FS.modifiedBy));

        var versions = getListProperty(file, FS.versions);
        if (versions == null) {
            versions = file.getModel().createList(version);
            file.addProperty(FS.versions, versions);
        } else {
            versions.add(version);
        }
    }

    @Override
    protected void doRead(String path, Integer version, OutputStream out, long start, Long finish) throws IOException {
        var blobId = transactions.calculateRead(dataset -> {
            var file = dataset.getDefaultModel()
                    .createResource(iri(path));
            var blobIdHolder = (version == null)
                    ? file
                    : getListProperty(file, FS.versions).get(version - 1).asResource();
            return blobIdHolder
                    .listProperties(FS.blobId)
                    .nextOptional()
                    .map(Statement::getString)
                    .orElseThrow(() -> new FileNotFoundException(path));
        });
        store.read(blobId, out, start, finish);
    }

    @Override
    protected void doCopy(String from, String to) throws IOException {
        copyOrMove(false, from, to);
    }

    @Override
    protected void doMove(String from, String to) throws IOException {
        try {
            permissions.ensureAdmin();
        } catch (io.fairspace.saturn.services.AccessDeniedException e) {
            throw new AccessDeniedException(from, to, "Only admins can move files.");
        }
        copyOrMove(true, from, to);
    }

    @Override
    public void doDelete(String path) throws IOException {
        try {
            permissions.ensureAdmin(); // TODO: Should be some different check
        } catch (io.fairspace.saturn.services.AccessDeniedException e) {
            throw new AccessDeniedException(path, null, "Only admins can delete files.");
        }
        transactions.executeWrite(dataset -> {
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
        transactions.executeWrite(dataset -> {
            var resource = dataset.getDefaultModel().createResource(iri(path));
            var user = dataset.getDefaultModel().createResource(userIriSupplier.get().getURI());
            var now = toXSDDateTimeLiteral(Instant.now());
            var purge = resource.hasProperty(FS.dateDeleted);
            if (purge) {
                permissions.ensureAdmin();
            }
            deleteRecursively(resource, now, user, purge);
        });
    }

    private void deleteRecursively(Resource resource, Literal date, Resource user, boolean purge) {
        if (resource.hasProperty(RDF.type, FS.Directory) || resource.hasProperty(RDF.type, FS.Collection)) {
            resource.listProperties(FS.contains)
                    .mapWith(Statement::getResource)
                    .filterKeep(r -> purge || !r.hasProperty(FS.dateDeleted))
                    .forEachRemaining(child -> deleteRecursively(child, date, user, purge));
        }

        if (purge) {
            resource.getModel()
                    .removeAll(resource, null, null)
                    .removeAll(null, null, resource);
        } else {
            resource.addLiteral(FS.dateDeleted, date)
                    .addProperty(FS.deletedBy, user);
        }
    }


    @Override
    protected void doUndelete(String path) throws IOException {
        transactions.executeWrite(dataset -> {
            var info = stat(path);
            if (info == null) {
                throw new FileNotFoundException(path);
            }
            if (info.isReadOnly() || info.getDeleted() == null) {
                throw new IOException("Cannot restore " + path);
            }

            var resource = dataset.getDefaultModel().createResource(iri(path));

            var date = resource.getProperty(FS.dateDeleted).getLiteral();
            var user = resource.getPropertyResourceValue(FS.deletedBy);

            undeleteRecursively(resource, date, user);
        });
    }

    private void undeleteRecursively(Resource resource, Literal date, Resource user) {
        if (resource.hasProperty(RDF.type, FS.Directory) || resource.hasProperty(RDF.type, FS.Collection)) {
            resource.listProperties(FS.contains)
                    .mapWith(Statement::getResource)
                    .filterKeep(r -> r.hasProperty(FS.dateDeleted, date) && r.hasProperty(FS.deletedBy, user))
                    .forEachRemaining(child -> undeleteRecursively(child, date, user));
        }

        resource.removeAll(FS.dateDeleted)
                .removeAll(FS.deletedBy);
    }

    @Override
    protected void doRevert(String path, int version) throws IOException {
        transactions.executeWrite(ds -> {
            var user = ds.getDefaultModel().createResource(userIriSupplier.get().getURI());
            var now = toXSDDateTimeLiteral(Instant.now());

            var file = ds.getDefaultModel().createResource(iri(path));

            createVersion(file);

            var versions = getListProperty(file, FS.versions);
            var ver = versions.get(version - 1).asResource();

            file.removeAll(FS.blobId)
                    .removeAll(FS.fileSize)
                    .removeAll(FS.md5)
                    .removeAll(FS.modifiedBy)
                    .removeAll(FS.dateModified)
                    .addLiteral(FS.blobId, ver.getRequiredProperty(FS.blobId).getLiteral())
                    .addLiteral(FS.fileSize, ver.getRequiredProperty(FS.fileSize).getLiteral())
                    .addLiteral(FS.md5, ver.getRequiredProperty(FS.md5).getLiteral())
                    .addProperty(FS.modifiedBy, user)
                    .addLiteral(FS.dateModified, now);
        });
    }

    @Override
    public void close() throws IOException {
    }

    @SneakyThrows
    @Subscribe
    public void onCollectionDeleted(CollectionDeletedEvent e) {
        transactions.executeWrite(dataset -> deleteWithoutChecks(e.getCollection().getLocation()));
    }

    @SneakyThrows
    @Subscribe
    public void onCollectionMoved(CollectionMovedEvent e) {
        transactions.executeWrite(dataset -> copyOrMoveNoCheck(true, e.getOldLocation(), e.getCollection().getLocation()));
    }

    @SneakyThrows
    @Subscribe
    public void onCollectionRestored(CollectionRestoredEvent e) {
        doUndelete(e.getCollection().getLocation());
    }

    private void copyOrMove(boolean move, String from, String to) throws IOException {
        if (from.equals(to) || to.startsWith(from + '/')) {
            var verb = move ? "move" : "copy";
            throw new FileAlreadyExistsException("Cannot" + verb + " a file or a directory to itself");
        }

        transactions.executeWrite(dataset -> {
            ensureCanCreate(to);
            var source = stat(from);
            if (source == null) {
                throw new FileNotFoundException(from);
            }
            copyOrMoveNoCheck(move, from, to);
        });
    }

    private void copyOrMoveNoCheck(boolean move, String from, String to) throws IOException {
        transactions.executeWrite(dataset -> {
            var src = dataset.getDefaultModel().createResource(iri(from));
            var dst = dataset.getDefaultModel().createResource(iri(to));
            dst.removeProperties();
            dst.addProperty(FS.filePath, to);
            var dir = parentPath(to);
            if (dir != null) {
                var parent = dataset.getDefaultModel().createResource(iri(dir));
                parent.addProperty(FS.contains, dst);
            }

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
