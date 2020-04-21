package io.fairspace.saturn.vfs;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

/**
 * Virtual File System abstractions
 * Implementations are NOT supposed to do exhaustive safety checks.
 */
public interface VirtualFileSystem extends Closeable {
    /**
     *
     * @param path here and in all other methods paths shall never start or end with a slash
     * @return file info or null if file doesn't exist
     * @throws IOException
     */
    FileInfo stat(String path) throws IOException;

    String iri(String path) throws IOException;

    default boolean exists(String path) throws IOException {
        return stat(path) != null;
    }

    List<FileInfo> list(String parentPath) throws IOException;

    FileInfo mkdir(String path) throws IOException;

    FileInfo create(String path, InputStream in) throws IOException;

    void modify(String path, InputStream in) throws IOException;

    void read(String path, OutputStream out, long start, Long finish) throws IOException;

    default void read(String path, OutputStream out) throws IOException {
        read(path, out, 0, null);
    };


    void copy(String from, String to) throws IOException;

    void move(String from, String to) throws IOException;

    void delete(String path) throws IOException;
}
