package io.fairspace.saturn.webdav.vfs.resources;

public interface VfsFileResource extends VfsResource {
    public String getMimeType();
    public long getFileSize();
    public String getContentLocation();
}
