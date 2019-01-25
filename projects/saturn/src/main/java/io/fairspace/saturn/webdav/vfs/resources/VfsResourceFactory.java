package io.fairspace.saturn.webdav.vfs.resources;

import java.util.List;

public interface VfsResourceFactory {
    public VfsResource getResource(String path);
    public VfsDirectoryResource createCollection(String parentId, String path);
    public List<? extends VfsResource> getChildren(String path);
    public VfsFileResource createFile(String parentId, String path, Long size, String contentType);
    public VfsFileResource markFileStored(VfsFileResource fileResource, String contentLocation);
}
