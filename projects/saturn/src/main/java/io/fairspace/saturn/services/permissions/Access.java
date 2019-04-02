package io.fairspace.saturn.services.permissions;

public enum Access {
    None,
    Read,
    Write,
    Manage;

    public boolean canRead() {
        return compareTo(Read) >= 0;
    }

    public boolean canWrite() {
        return compareTo(Write) >= 0;
    }

    public boolean canManage() {
        return compareTo(Manage) >= 0;
    }
}
