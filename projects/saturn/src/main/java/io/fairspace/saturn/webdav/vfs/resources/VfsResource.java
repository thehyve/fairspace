package io.fairspace.saturn.webdav.vfs.resources;

import java.time.Instant;

public interface VfsResource {
    /**
     * Returns a unique identifier for this resource
     * @return
     */
    String getUniqueId();

    /**
     * Returns the local name for this resource, without the path
     * @return
     */
    String getName();

    /**
     * Returns the full path for this resource, including leading slash
     * @return
     */
    String getPath();

    /**
     * Returns the moment that this resource was first created
     * @return
     */
    Instant getCreatedDate();

    /**
     * Returns the moment that this resource was last modified
     * @return
     */
    Instant getModifiedDate();

    /**
     * Returns the user that has created this resource
     * @return
     */
    VfsUser getCreator();
}
