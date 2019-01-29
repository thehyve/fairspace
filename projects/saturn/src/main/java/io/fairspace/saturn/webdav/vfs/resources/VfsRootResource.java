package io.fairspace.saturn.webdav.vfs.resources;

import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;

public class VfsRootResource implements VfsCollectionResource {
    private VfsResourceFactory resourceFactory;

    public VfsRootResource(VfsResourceFactory resourceFactory) {
        this.resourceFactory = resourceFactory;
    }

    @Override
    public String getUniqueId() {
        return null;
    }

    @Override
    public String getName() {
        return "root";
    }

    @Override
    public String getPath() {
        return "/";
    }

    @Override
    public Instant getCreatedDate() {
        return null;
    }

    @Override
    public Instant getModifiedDate() {
        return null;
    }

    @Override
    public VfsUser getCreator() {
        return null;
    }

    @Override
    public List<? extends VfsResource> getChildren() {
        return resourceFactory.getFairspaceCollections();
    }

    @Override
    public VfsResource getChild(String name) {
        return resourceFactory.getFairspaceCollection(name);
    }

    @Override
    public VfsDirectoryResource createCollection(String name) {
        // It is not allowed to create new top level directories
        return null;
    }

    @Override
    public VfsFileResource createFile(String name, String contentType, InputStream inputStream) throws IOException {
        // It is not allowed to create files at the top level
        return null;
    }



}
