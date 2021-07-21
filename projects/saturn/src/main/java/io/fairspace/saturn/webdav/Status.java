package io.fairspace.saturn.webdav;

public enum Status {
    /**
     * Editing of collection contents is enabled.
     */
    Active,
    /**
     * The contents of the collection is read-only.
     */
    ReadOnly,
    /**
     * The contents of the collection is not accessible.
     */
    Closed,
    /**
     * The content of the collection is permanently unavailable.
     */
    Deleted
}
