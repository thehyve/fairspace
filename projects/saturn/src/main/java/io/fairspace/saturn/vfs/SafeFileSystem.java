package io.fairspace.saturn.vfs;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.FileAlreadyExistsException;
import java.util.List;

import static io.fairspace.saturn.vfs.PathUtils.normalizePath;

/**
 * A guarding wrapper around a VirtualFileSystem
 */

// TODO: more checks
public class SafeFileSystem implements VirtualFileSystem {
    private final VirtualFileSystem unsafe;

    public SafeFileSystem(VirtualFileSystem unsafe) {
        this.unsafe = unsafe;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        var normalizedPath = normalizePath(path);
        return safely(() -> unsafe.stat(normalizedPath));
    }

    @Override
    public List<FileInfo> list(String path) throws IOException {
        var normalizedPath = normalizePath(path);
        return safely(() -> {
            var info = stat(normalizedPath);

            if (info == null) {
                throw new FileNotFoundException(normalizedPath);
            }
            if (!info.isDirectory()) {
                throw new IOException("Not a directory: " + normalizedPath);
            }

            return unsafe.list(normalizedPath);
        });
    }

    @Override
    public void mkdir(String path) throws IOException {
        var normalizedPath = normalizePath(path);
        safely(() -> {
            if (exists(normalizedPath)) {
                throw new FileAlreadyExistsException(normalizedPath);
            }
            unsafe.mkdir(normalizedPath);
            if (stat(normalizedPath) == null) {
                throw new FileNotFoundException("Error creating directory: " + normalizedPath);
            }
            return null;
        });
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        var normalizedPath = normalizePath(path);
        safely(() -> {
            if (exists(normalizedPath)) {
                throw new FileAlreadyExistsException(normalizedPath);
            }
            unsafe.create(normalizedPath, in);
            if (stat(normalizedPath) == null) {
                throw new FileNotFoundException("Error creating file: " + normalizedPath);
            }
            return null;
        });
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        var normalizedPath = normalizePath(path);
        safely(() -> {
            unsafe.modify(normalizedPath, in);
            return null;
        });
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        var normalizedPath = normalizePath(path);
        safely(() -> {
            unsafe.read(normalizedPath, out);
            return null;
        });
    }

    @Override
    public void copy(String from, String to) throws IOException {
        var normalizedFrom = normalizePath(from);
        var normalizedTo = normalizePath(to);
        if (normalizedFrom.equals(normalizedTo) || normalizedTo.startsWith(normalizedFrom + '/')) {
            throw new IOException("Cannot copy a file or a directory to itself");
        }
        safely(() -> {
            if (!exists(from)) {
                throw new FileNotFoundException(normalizedFrom);
            }
            if (exists(normalizedTo)) {
                throw new FileAlreadyExistsException(normalizedTo);
            }
            unsafe.copy(normalizedFrom, normalizedTo);
            if (!exists(normalizedTo)) {
                throw new FileNotFoundException("Error copying from " + normalizedFrom + " to " + normalizedTo);
            }
            return null;
        });
    }

    @Override
    public void move(String from, String to) throws IOException {
        var normalizedFrom = normalizePath(from);
        var normalizedTo = normalizePath(to);
        if (normalizedFrom.equals(normalizedTo) || normalizedTo.startsWith(normalizedFrom + '/')) {
            throw new FileAlreadyExistsException("Cannot move a file or a directory to itself");
        }
        safely(() -> {
            if (!exists(normalizedFrom)) {
                throw new FileNotFoundException(normalizedFrom);
            }
            if (exists(normalizedTo)) {
                throw new FileAlreadyExistsException(normalizedTo);
            }
            unsafe.move(normalizedFrom, normalizedTo);
            if (!exists(normalizedTo)) {
                throw new FileNotFoundException("Error moving from " + normalizedFrom + " to " + normalizedTo);
            }
            return null;
        });
    }

    @Override
    public void delete(String path) throws IOException {
        var normalizedPath = normalizePath(path);
        safely(() -> {
            var info = stat(normalizedPath);
            if (info == null) {
                throw new FileNotFoundException(normalizedPath);
            }
            if (info.isReadOnly()) {
                throw new IOException("File is read-only: " + normalizedPath);
            }
            unsafe.delete(normalizedPath);
            if (exists(normalizedPath)) {
                throw new IOException("Error deleting: " + normalizedPath);
            }
            return null;
        });
    }

    @Override
    public void close() throws IOException {
        safely(() -> {
            unsafe.close();
            return null;
        });
    }

    private <T> T safely(UnsafeAction<T> action) throws IOException {
        try {
            return action.perform();
        } catch (IOException e) {
            throw e;
        } catch (Throwable t) {
            throw new IOException(t);
        }
    }

    @Override
    public boolean exists(String path) throws IOException {
        var normalizedPath = normalizePath(path);
        return safely(() -> unsafe.exists(normalizedPath));
    }

    @FunctionalInterface
    interface UnsafeAction<T> {
        T perform() throws IOException;
    }
}
