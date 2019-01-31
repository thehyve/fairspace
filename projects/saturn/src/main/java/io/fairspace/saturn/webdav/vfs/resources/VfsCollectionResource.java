package io.fairspace.saturn.webdav.vfs.resources;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Represents a collection with children in the virtual file system
 * Could be either the root, a FairspaceCollection or a directory
 */
public interface VfsCollectionResource extends VfsResource {
    VfsDirectoryResource createCollection(String name);
    VfsResource getChild(String name);
    List<? extends VfsResource> getChildren();
    VfsFileResource createFile(String name, String contentType, InputStream inputStream)  throws IOException;
}
