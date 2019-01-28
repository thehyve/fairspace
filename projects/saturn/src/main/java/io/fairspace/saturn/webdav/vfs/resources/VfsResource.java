package io.fairspace.saturn.webdav.vfs.resources;

import java.time.ZonedDateTime;

public interface VfsResource {
    public String getUniqueId();
    public String getName();
    public String getPath();
    public ZonedDateTime getCreatedDate();
    public ZonedDateTime getModifiedDate();
    public VfsUser getCreator();
    public String getParentId();
}
