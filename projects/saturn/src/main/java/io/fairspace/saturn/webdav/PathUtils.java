package io.fairspace.saturn.webdav;

import io.milton.http.exceptions.BadRequestException;

import java.util.Base64;

import static io.fairspace.saturn.rdf.search.IndexDispatcher.COLLECTION_PREFIX;
import static org.apache.commons.lang3.StringUtils.strip;
import static org.apache.http.client.utils.URLEncodedUtils.formatSegments;

public class PathUtils {
    private static final int MAX_COLLECTION_NAME_LENGTH = 255 - COLLECTION_PREFIX.length();

    public static String normalizePath(String path) {
        return strip(path, "/");
    }

    public static String encodePath(String path) {
        return normalizePath(formatSegments(splitPath(path)));
    }

    public static String[] splitPath(String path) {
        return normalizePath(path).split("/");
    }

    public static String name(String path) {
        var parts = splitPath(path);
        return (parts.length == 0) ? "" :  parts[parts.length - 1];
    }

    public static void validateCollectionName(String name) throws BadRequestException {
        if (name.length() > MAX_COLLECTION_NAME_LENGTH) {
            throw new BadRequestException(
                    "The collection name exceeds maximum length " + MAX_COLLECTION_NAME_LENGTH + ".");
        }
    }

    public static String generateCollectionName(String value) {
        return Base64.getUrlEncoder().encodeToString(value.getBytes());
    }
}
