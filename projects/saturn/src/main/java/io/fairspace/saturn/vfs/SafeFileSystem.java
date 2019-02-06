package io.fairspace.saturn.vfs;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

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
        return safely(() -> unsafe.stat(path));
    }

    @Override
    public List<FileInfo> list(String path) throws IOException {
        return safely(() -> {
            var info = stat(path);

            if (info == null) {
                throw new FileNotFoundException(path);
            }
            if (!info.isDirectory()) {
                throw new IOException("Not a directory: " + path);
            }

            return unsafe.list(path);
        });
    }

    @Override
    public void mkdir(String path) throws IOException {
        safely(() -> {
            if (exists(path)) {
                throw new IOException("File already exists: " + path);
            }
            unsafe.mkdir(path);
            if (stat(path) == null) {
                throw new FileNotFoundException("Error creating directory: " + path);
            }
            return null;
        });
    }

    @Override
    public void create(String path, InputStream in) throws IOException {
        safely(() -> {
            if (exists(path)) {
                throw new IOException("File already exists: " + path);
            }
            unsafe.create(path, in);
            if (stat(path) == null) {
                throw new FileNotFoundException("Error creating file: " + path);
            }
            return null;
        });

    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        safely(() -> {
            unsafe.modify(path, in);
            return null;
        });
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        safely(() -> {
            unsafe.read(path, out);
            return null;
        });
    }

    @Override
    public void copy(String from, String to) throws IOException {
        safely(() -> {
            if (!exists(from)) {
                throw new FileNotFoundException(from);
            }
            var info = stat(to);
            if (info != null && info.isReadOnly()) {
                throw new IOException("Cannot copy to " + to);
            }
            unsafe.copy(from, to);
            if (!exists(to)) {
                throw new FileNotFoundException("Error copying from " + from + " to " + to);
            }
            return null;
        });
    }

    @Override
    public void move(String from, String to) throws IOException {
        safely(() -> {
            if (!exists(from)) {
                throw new FileNotFoundException(from);
            }
            var info = stat(to);
            if (info != null && info.isReadOnly()) {
                throw new IOException("Cannot move to " + to);
            }
            unsafe.move(from, to);
            if (!exists(to)) {
                throw new FileNotFoundException("Error moving from " + from + " to " + to);
            }
            return null;
        });
    }

    @Override
    public void delete(String path) throws IOException {
        safely(() -> {
            var info = stat(path);
            if (info == null) {
                throw new FileNotFoundException(path);
            }
            if (info.isReadOnly()) {
                throw new IOException("File is read-only: " + path);
            }
            unsafe.delete(path);
            if (exists(path)) {
                throw new IOException("Error deleting: " + path);
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
        return safely(() -> unsafe.exists(path));
    }

    @FunctionalInterface
    interface UnsafeAction<T> {
        T perform() throws IOException;
    }
}
