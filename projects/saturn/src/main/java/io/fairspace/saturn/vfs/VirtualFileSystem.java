package io.fairspace.saturn.vfs;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

/**
 * Virtual File System abstractions
 * Implementations are NOT supposed to do exhaustive safety checks. Use SafeFileSystem wrapper instead.
 */
public interface VirtualFileSystem extends Closeable {
    /**
     *
     * @param path here and in all other methods paths shall never start or end with a slash
     * @return file info or null if file doesn't exist
     * @throws IOException
     */
    FileInfo stat(String path) throws IOException;

    default boolean exists(String path) throws IOException {
        return stat(path) != null;
    }

    List<FileInfo> list(String parentPath) throws IOException;

    void mkdir(String path) throws IOException;

    void create(String path, InputStream in) throws IOException;

    void modify(String path, InputStream in) throws IOException;

    void read(String path, long offset, long maxLength, OutputStream out) throws IOException;

    default void read(String path, OutputStream out) throws IOException {
        read(path, 0, Long.MAX_VALUE, out);
    }

    void copy(String from, String to) throws IOException;

    void move(String from, String to) throws IOException;

    void delete(String path) throws IOException;
}
