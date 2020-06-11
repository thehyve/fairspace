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
import java.nio.file.FileSystemException;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.vfs.PathUtils.splitPath;

public class CompoundFileSystem extends BaseFileSystem {

    private final Map<? super String, ? extends VirtualFileSystem> fileSystemsByType;

    public CompoundFileSystem(CollectionsService collections, Map<? super String, ? extends VirtualFileSystem> fileSystemsByType) {
        super(collections);
        this.fileSystemsByType = fileSystemsByType;
    }

    @Override
    protected FileInfo statRegularFile(String path, Integer version) throws IOException {
        VirtualFileSystem vfs;
        try {
            vfs = fileSystemByPath(path, false);
        } catch (FileNotFoundException e) {
            return null;
        }
        return vfs.stat(path, version);
    }

    @Override
    protected List<FileInfo> listCollectionOrDirectory(String parentPath) throws IOException {
        return fileSystemByPath(parentPath, false).list(parentPath);
    }

    @Override
    protected FileInfo doMkdir(String path) throws IOException {
        return fileSystemByPath(path, true).mkdir(path);
    }

    @Override
    protected FileInfo doCreate(String path, InputStream in) throws IOException {
        return fileSystemByPath(path, true).create(path, in);
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        fileSystemByPath(path, true).modify(path, in);
    }

    @Override
    protected void doRead(String path, Integer version, OutputStream out, long start, Long finish) throws IOException {
        fileSystemByPath(path, false).read(path, version, out, start, finish);
    }

    @Override
    protected void doCopy(String from, String to) throws IOException {
        if (fileSystemByPath(from, false).equals(fileSystemByPath(to, true))) {
            fileSystemByPath(from, true).copy(from, to);
        } else {
            throw new FileSystemException("Copying files between collections of different types is not implemented yet");
        }
    }

    @Override
    protected void doMove(String from, String to) throws IOException {
        if (fileSystemByPath(from, true).equals(fileSystemByPath(to, true))) {
            fileSystemByPath(from, true).move(from, to);
        } else {
            throw new FileSystemException("Moving files between collections of different types is not implemented yet");
        }
    }

    @Override
    protected void doDelete(String path) throws IOException {
        fileSystemByPath(path, true).delete(path);
    }

    @Override
    protected void doUndelete(String path) throws IOException {
        fileSystemByPath(path, true).undelete(path);
    }

    @Override
    protected void doRevert(String path, int version) throws IOException {
        fileSystemByPath(path, true).revert(path, version);
    }

    @Override
    public void close() throws IOException {
        for (var c: fileSystemsByType.values()) {
            c.close();
        }
    }

    private VirtualFileSystem fileSystemByPath(String path, boolean mustBeWritable) throws IOException {
        var collection = collectionByPath(path);

        if (mustBeWritable && !collection.canWrite()) {
            throw new IOException("Target path is read-only");
        }

        return fileSystemForCollection(collection);
    }

    private Collection collectionByPath(String path) throws IOException {
        if (path.isEmpty()) {
            throw new AccessDeniedException("File operations on the root directory are not allowed");
        }
        var collection = collections.getByLocation(splitPath(path)[0]);
        if (collection == null) {
            throw new FileNotFoundException(path);
        }

        return collection;
    }

    private VirtualFileSystem fileSystemForCollection(Collection collection) throws IOException {
        var fs = fileSystemsByType.get(collectionType(collection));
        if (fs == null){
            throw new IOException("Unknown file system type for " + collection.getLocation());
        }
        return fs;
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
