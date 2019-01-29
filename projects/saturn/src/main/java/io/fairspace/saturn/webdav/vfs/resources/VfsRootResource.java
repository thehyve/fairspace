package io.fairspace.saturn.webdav.vfs.resources;

import java.time.Instant;

public class VfsRootResource implements VfsCollectionResource {
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
    public String getParentId() {
        return null;
    }
}
