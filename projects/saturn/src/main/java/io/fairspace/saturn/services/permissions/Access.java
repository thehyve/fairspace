package io.fairspace.saturn.services.permissions;

public enum Access {
    None,
    List,
    Read,
    Write,
    Manage;

    public boolean canList() {
        return compareTo(List) >= 0;
    }

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
