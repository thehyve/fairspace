package io.fairspace.saturn.webdav;

import io.milton.http.exceptions.BadRequestException;

import java.util.regex.Pattern;

import static org.apache.commons.lang3.StringUtils.strip;
import static org.apache.http.client.utils.URLEncodedUtils.formatSegments;

public class PathUtils {
    private static final Pattern VALID_COLLECTION_NAMES = Pattern.compile(
            "[a-z0-9_-]+",
            Pattern.CASE_INSENSITIVE);
    private static final int MAX_COLLECTION_NAME_LENGTH = 127;

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
        if (name == null || name.isEmpty()) {
            throw new BadRequestException(
                    "The collection name is empty.");
        }
        if (name.length() > MAX_COLLECTION_NAME_LENGTH) {
            throw new BadRequestException(
                    "The collection name exceeds maximum length " + MAX_COLLECTION_NAME_LENGTH + ".");
        }
        if (!VALID_COLLECTION_NAMES.matcher(name).matches()) {
            throw new BadRequestException(
                    "The collection name should only contain " +
                            "letters a-z and A-Z, " +
                            "numbers 0-9, " +
                            "and the characters `-` and `_`.");
        }
    }
}
