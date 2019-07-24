package io.fairspace.saturn.vfs;

import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.AccessDeniedException;
import java.util.List;

import static io.fairspace.saturn.vfs.PathUtils.splitPath;
import static java.time.Instant.ofEpochMilli;
import static java.util.stream.Collectors.toList;

public abstract class BaseFileSystem implements VirtualFileSystem {
    private static final FileInfo ROOT = FileInfo.builder()
            .path("")
            .readOnly(false)
            .isDirectory(true)
            .created(ofEpochMilli(0))
            .modified(ofEpochMilli(0))
            .build();

    protected final CollectionsService collections;

    public BaseFileSystem(CollectionsService collections) {
        this.collections = collections;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        if (path.isEmpty()) {
            return ROOT;
        }
        if (isCollection(path)) {
            var collection = collections.getByLocation(path);
            if (collection == null) {
                return null;
            }
            return fileInfo(collection);
        }
        return statRegularFile(path);
    }

    @Override
    public String iri(String path) throws IOException {
        if (path.isEmpty()) {
            return null;
        }
        if (isCollection(path)) {
            var collection = collections.getByLocation(path);
            if (collection == null) {
                return null;
            }
            return collection.getIri().getURI();
        }
        return fileIri(path);
    }

    protected abstract String fileIri(String path) throws IOException;

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        if (parentPath.isEmpty()) {
            return collections.list()
                    .stream()
                    .map(BaseFileSystem::fileInfo)
                    .collect(toList());
        }
        return listCollectionOrDirectory(parentPath);
    }

    @Override
    public void mkdir(String path) throws IOException {
        ensureValidPath(path);

        doMkdir(path);
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        ensureValidPath(path);

        doCreate(path, in);
    }

    @Override
    public void copy(String from, String to) throws IOException {
        ensureValidPath(from);
        ensureValidPath(to);

        doCopy(from, to);
    }

    @Override
    public void move(String from, String to) throws IOException {
        ensureValidPath(from);
        ensureValidPath(to);

        doMove(from, to);

    }

    @Override
    public void delete(String path) throws IOException {
        ensureValidPath(path);

        doDelete(path);
    }

    @Override
    public void close() throws IOException {
    }

    protected abstract FileInfo statRegularFile(String path) throws IOException;

    protected abstract List<FileInfo> listCollectionOrDirectory(String parentPath) throws IOException;

    protected abstract void doMkdir(String path) throws IOException;

    protected abstract void doCreate(String path, InputStream in) throws IOException;

    protected abstract void doCopy(String from, String to) throws IOException;

    protected abstract void doMove(String from, String to) throws IOException;

    protected abstract void doDelete(String path) throws IOException;

    private static boolean isCollection(String path) {
        return splitPath(path).length == 1;
    }

    private static void ensureValidPath(String path) throws IOException {
        if (path.isEmpty()) {
            throw new AccessDeniedException("File operations on the root directory are not allowed");
        }
        if (isCollection(path)) {
            throw new AccessDeniedException("Use Collections API for operations on collections");
        }
    }


    private static FileInfo fileInfo(Collection collection) {
        return FileInfo.builder()
                .path(collection.getLocation())
                .size(0)
                .isDirectory(true)
                .created(collection.getDateCreated())
                .modified(collection.getDateCreated())
                .readOnly(!collection.canWrite())
                .build();
    }
}
