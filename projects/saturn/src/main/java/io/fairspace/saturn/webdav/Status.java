package io.fairspace.saturn.webdav;

public enum Status {
    /**
     * Editing of collection contents is enabled.
     */
    Active,
    /**
     * The contents of the collection is read-only.
     */
    Archived,
    /**
     * The contents of the collection is not accessible.
     */
    Closed
}
