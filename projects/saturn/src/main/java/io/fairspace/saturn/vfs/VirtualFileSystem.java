package io.fairspace.saturn.vfs;

import java.io.Closeable;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

public interface VirtualFileSystem extends Closeable {
    FileInfo stat(String path) throws IOException;

    List<FileInfo> list(String parentPath) throws IOException;

    void mkdir(String path) throws IOException;

    void write(String path, InputStream in) throws IOException;

    void read(String path, OutputStream out) throws IOException;

    void copy(String from, String to) throws IOException;

    void move(String from, String to) throws IOException;

    void delete(String path) throws IOException;
}
