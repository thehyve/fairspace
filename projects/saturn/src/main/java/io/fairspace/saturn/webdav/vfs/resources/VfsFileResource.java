package io.fairspace.saturn.webdav.vfs.resources;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Represents a file in the virtual file system
 */
public interface VfsFileResource extends VfsResource {
    String getMimeType();
    long getFileSize();

    void sendContent(OutputStream outputStream) throws IOException;
    VfsFileResource updateContents(String contentType, InputStream inputStream) throws IOException;
}
