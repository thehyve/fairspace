package io.fairspace.saturn.webdav.vfs.resources;

import java.time.Instant;

public interface VfsResource {
    public String getUniqueId();
    public String getName();
    public String getPath();
    public Instant getCreatedDate();
    public Instant getModifiedDate();
    public VfsUser getCreator();
    public String getParentId();
}
