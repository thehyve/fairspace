package io.fairspace.saturn.vfs;

import java.util.stream.Stream;

import static java.util.stream.Collectors.joining;
import static org.apache.commons.lang3.StringUtils.strip;

public class PathUtils {
    public static String normalizePath(String path) {
        return strip(path, "/");
    }

    public static String[] splitPath(String path) {
        return normalizePath(path).split("/");
    }

    public static String subPath(String path) {
        return Stream.of(splitPath(path))
                .skip(1)
                .collect(joining("/"));
    }

    public static String joinPaths(String parentPath, String subPath) {
        return normalizePath(normalizePath(parentPath) + '/' + normalizePath(subPath));
    }

    public static String name(String path) {
        var parts = splitPath(path);
        return (parts.length == 0) ? "" : parts[parts.length - 1];
    }

    public static String parentPath(String path) {
        return path.substring(0, path.lastIndexOf('/'));
    }
}
