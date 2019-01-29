package io.fairspace.saturn.webdav.vfs.resources;

import java.util.List;

public interface VfsResourceFactory {
    VfsResource getResource(String path);

    List<? extends VfsFairspaceCollectionResource> getFairspaceCollections();
    VfsResource getFairspaceCollection(String name);
}
