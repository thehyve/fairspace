package io.fairspace.saturn.vfs;

import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.vfs.PathUtils.splitPath;
import static java.time.Instant.ofEpochMilli;
import static java.util.stream.Collectors.toList;

public class CompoundFileSystem implements VirtualFileSystem {
    private static final FileInfo ROOT = FileInfo.builder()
            .path("")
            .readOnly(false)
            .isDirectory(true)
            .created(ofEpochMilli(0))
            .modified(ofEpochMilli(0))
            .build();

    private final CollectionsService collections;
    private final Map<? super String, ? extends VirtualFileSystem> fileSystemsByType;

    public CompoundFileSystem(CollectionsService collections, Map<? super String, ? extends VirtualFileSystem> fileSystemsByType) {
        this.collections = collections;
        this.fileSystemsByType = fileSystemsByType;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        if (path.isEmpty()) {
            return ROOT;
        }
        return fileSystemByPath(path, false).stat(path);
    }

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        if (parentPath.isEmpty()) {
            return collections.list()
                    .stream()
                    .map(CompoundFileSystem::fileInfo)
                    .collect(toList());
        }
        return fileSystemByPath(parentPath, false).list(parentPath);
    }

    @Override
    public void mkdir(String path) throws IOException {
        fileSystemByPath(path, true).mkdir(path);
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        fileSystemByPath(path, true).create(path, in);
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        fileSystemByPath(path, true).modify(path, in);
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        fileSystemByPath(path, false).read(path, out);
    }

    @Override
    public void copy(String from, String to) throws IOException {
        if (fileSystemByPath(from, false).equals(fileSystemByPath(to, true))) {
            fileSystemByPath(from, true).copy(from, to);
        } else {
            throw new IOException("Copying files between collections of different types is not implemented yet");
        }
    }

    @Override
    public void move(String from, String to) throws IOException {
        if (fileSystemByPath(from, true).equals(fileSystemByPath(to, true))) {
            fileSystemByPath(from, true).move(from, to);
        } else {
            throw new IOException("Moving files between collections of different types is not implemented yet");
        }
    }

    @Override
    public void delete(String path) throws IOException {
        fileSystemByPath(path, true).delete(path);
    }

    @Override
    public void close() throws IOException {
        for (var c: fileSystemsByType.values()) {
            c.close();
        }
    }

    private VirtualFileSystem fileSystemByPath(String path, boolean mustBeWritable) throws IOException {
        if (path.isEmpty()) {
            throw new AccessDeniedException("File operations on the root directory are not allowed");
        }
        var collection = collections.getByLocation(splitPath(path)[0]);
        if (collection == null) {
            throw new FileNotFoundException(path);
        }
        if (mustBeWritable && !collection.canWrite()) {
            throw new IOException("Target path is read-only");
        }
        var fs = fileSystemsByType.get(collectionType(collection));
        if (fs == null){
            throw new FileNotFoundException(path);
        }
        return fs;
    }

    private static FileInfo fileInfo(Collection collection) {
        return FileInfo.builder()
                .iri(collection.getIri().getURI())
                .path(collection.getLocation())
                .size(0)
                .isDirectory(true)
                .created(collection.getDateCreated())
                .modified(collection.getDateCreated())
                .readOnly(!collection.canWrite())
                .build();
    }

    private static String collectionType(Collection collection) throws IOException {
        try {
            return collection.getConnectionString().isEmpty()
                    ? ManagedFileSystem.TYPE
                    : new URI(collection.getConnectionString()).getScheme();
        } catch (URISyntaxException e) {
            throw new IOException(e);
        }
    }
}
