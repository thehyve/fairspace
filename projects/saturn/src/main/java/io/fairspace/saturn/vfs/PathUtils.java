package io.fairspace.saturn.vfs;

public class PathUtils {
    public static String normalizePath(String path) {
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        return path;
    }

    public static String[] splitPath(String path) {
        return normalizePath(path).split("/");
    }
}
