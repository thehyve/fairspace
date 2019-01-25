package io.fairspace.saturn.webdav.vfs.resources;

/**
 * Represents a file in the virtual file system
 */
public interface VfsFileResource extends VfsResource {
    public String getMimeType();
    public long getFileSize();
    public String getContentLocation();
}
