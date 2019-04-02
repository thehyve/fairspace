package io.fairspace.saturn.vfs;

import static org.apache.commons.lang3.StringUtils.strip;

public class PathUtils {
    public static String normalizePath(String path) {
        return strip(path, "/");
    }

    public static String[] splitPath(String path) {
        return normalizePath(path).split("/");
    }

    public static String name(String path) {
        var parts = splitPath(path);
        return (parts.length == 0) ? "" :  parts[parts.length - 1];
    }

    public static String parentPath(String path) {
        return path.substring(0, path.lastIndexOf('/'));
    }
}
