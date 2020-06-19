package io.fairspace.saturn.webdav;

import java.util.Arrays;
import java.util.stream.Stream;

import static java.util.stream.Collectors.joining;
import static org.apache.commons.lang3.StringUtils.join;
import static org.apache.commons.lang3.StringUtils.strip;
import static org.apache.http.client.utils.URLEncodedUtils.formatSegments;
import static org.apache.http.client.utils.URLEncodedUtils.parsePathSegments;

public class PathUtils {
    private static final String[] INVALID_BASENAMES = {".", ".."};

    public static String normalizePath(String path) {
        return strip(path, "/");
    }

    public static String encodePath(String path) {
        return normalizePath(formatSegments(splitPath(path)));
    }

    public static String decodePath(String path) {
        return normalizePath(join(parsePathSegments(path), "/"));
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
        return (parts.length == 0) ? "" :  parts[parts.length - 1];
    }

    public static String parentPath(String path) {
        var idx = path.lastIndexOf('/');
        return idx > 0 ? path.substring(0, idx) : null;
    }

    public static boolean containsInvalidPathName(String path) {
        return Arrays.asList(INVALID_BASENAMES).contains(name(path));
    }
}
