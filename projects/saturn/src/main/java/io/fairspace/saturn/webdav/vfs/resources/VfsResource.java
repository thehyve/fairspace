package io.fairspace.saturn.webdav.vfs.resources;

import java.time.Instant;

public interface VfsResource {
    String getUniqueId();
    String getName();
    String getPath();
    Instant getCreatedDate();
    Instant getModifiedDate();
    VfsUser getCreator();
}
