package io.fairspace.saturn.vfs;

import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Stream;

import static io.fairspace.saturn.vfs.PathUtils.splitPath;
import static java.time.Instant.ofEpochMilli;
import static java.util.stream.Collectors.toList;

public abstract class BaseFileSystem implements VirtualFileSystem {
    // The file system must be compatible with many external systems.
    // For that reason, we disallow many special characters, as they
    // may cause problems in certain other systems.
    // This list is taken from
    // https://blogs.msdn.microsoft.com/robert_mcmurray/2011/04/27/bad-characters-to-use-in-web-based-filenames/
    // and is mainly based on characters that should not be in a URI
    private static final Character[] INVALID_BASENAME_CHARACTERS = {
            ';', '/', '?', ':', '@',
            '&', '=', '+', '$', ',',
            '<', '>', '#', '%', '"',
            '{', '}', '|', '\\', '^', '[', ']', '`'
    };

    // Regex to extract the basename from a path. It can handle
    // trailing slashes as well as filenames consisting of
    // only backslashes (\\\)
    private static final String BASENAME_REGEX = "^.*?([^/]+)/*$";

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
        return fileOrDirectoryIri(path);
    }

    protected abstract String fileOrDirectoryIri(String path) throws IOException;

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

        if (containsInvalidBaseName(path)) {
            throw new InvalidFilenameException("The given filename contains invalid special characters");
        }
    }

    static boolean containsInvalidBaseName(String path) {
        String baseName = path.replaceFirst(BASENAME_REGEX, "$1");

        return Stream.of(INVALID_BASENAME_CHARACTERS)
                .anyMatch(character -> baseName.indexOf(character) > -1);
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
