package io.fairspace.saturn.webdav.vfs.resources;

import java.time.ZonedDateTime;

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
    public ZonedDateTime getCreatedDate() {
        return null;
    }

    @Override
    public ZonedDateTime getModifiedDate() {
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
