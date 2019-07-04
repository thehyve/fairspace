package io.fairspace.saturn.vfs;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import static io.fairspace.saturn.vfs.Pipe.pipe;
import static org.apache.commons.io.FilenameUtils.getName;

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

    default boolean exists(String path) throws IOException {
        return stat(path) != null;
    }

    List<FileInfo> list(String parentPath) throws IOException;

    void mkdir(String path) throws IOException;

    void create(String path, InputStream in) throws IOException;

    void modify(String path, InputStream in) throws IOException;

    void read(String path, OutputStream out) throws IOException;

    default void copy(String from, String to) throws IOException {
        var src = stat(from);
        if (src.isDirectory()) {
            mkdir(to);
            for (var child: list(from)) {
                copy(child.getPath(), to + '/' + getName(child.getPath()));
            }
        } else {
            pipe(out -> read(from, out), in -> create(to, in));
        }
    }

    default void move(String from, String to) throws IOException {
        copy(from, to);
        delete(from);
    }

    void delete(String path) throws IOException;
}
