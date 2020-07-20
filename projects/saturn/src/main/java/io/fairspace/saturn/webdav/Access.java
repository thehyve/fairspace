package io.fairspace.saturn.webdav;

import java.util.EnumSet;

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
     
    public static <T extends Enum<T>> T max(T x, T y) {
        return x.compareTo(y) > 0 ? x : y;
    }
}
