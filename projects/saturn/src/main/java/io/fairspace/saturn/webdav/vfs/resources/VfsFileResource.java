package io.fairspace.saturn.webdav.vfs.resources;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Represents a file in the virtual file system
 */
public interface VfsFileResource extends VfsResource {
    /**
     * Returns the content type for the current file
     * @return
     */
    String getContentType();

    /**
     * Returns the filesize in bytes for the current file
     * @return
     */
    long getFileSize();

    /**
     * Sends the contents of the current file to the given outputstream
     * @param outputStream
     * @throws IOException
     */
    void sendContent(OutputStream outputStream) throws IOException;

    /**
     * Updates the contents of the current file, with the contents of the given inputstream
     * @param contentType
     * @param inputStream
     * @return
     * @throws IOException
     */
    VfsFileResource updateContents(String contentType, InputStream inputStream) throws IOException;
}
