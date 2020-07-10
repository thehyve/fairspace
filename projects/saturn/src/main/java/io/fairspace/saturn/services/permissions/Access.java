package io.fairspace.saturn.services.permissions;

import java.util.EnumSet;

public enum Access {
    None,
    Member,
    List,
    Read,
    Write,
    Manage;

    public static EnumSet<Access> WorkspaceAccess = EnumSet.of(None, Member, Manage);
    public static EnumSet<Access> CollectionAccess = EnumSet.of(None, List, Read, Write, Manage);

    public boolean isMember() {
        return compareTo(Member) >= 0;
    }

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
