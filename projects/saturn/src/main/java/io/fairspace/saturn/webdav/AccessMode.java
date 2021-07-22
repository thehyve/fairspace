package io.fairspace.saturn.webdav;

public enum AccessMode {
    /**
     * Metadata and contents are visible and readable
     * only by selected workspaces and users.
     * Not allowed in {@link Status#ReadOnly} status.
     */
    Restricted,
    /**
     * Metadata are visible by all users.
     */
    MetadataPublished,
    /**
     * Contents are readable by all users.
     * Only allowed in {@link Status#ReadOnly} status.
     */
    DataPublished
}
