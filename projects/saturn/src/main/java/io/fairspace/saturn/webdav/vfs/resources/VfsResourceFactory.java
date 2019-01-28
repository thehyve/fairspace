package io.fairspace.saturn.webdav.vfs.resources;

import java.util.List;

public interface VfsResourceFactory {
    public VfsResource getResource(String path);
    public VfsDirectoryResource createDirectory(String parentId, String path);
    public List<? extends VfsResource> getChildren(String parentId);
    public VfsFileResource storeFile(String parentId, String path, Long size, String contentType, String contentLocation);
    public VfsFileResource updateFile(VfsResource resource, Long size, String contentType, String contentLocation);
}
