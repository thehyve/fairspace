package io.fairspace.neptune.service;

import io.fairspace.neptune.web.CollectionNotFoundException;
import lombok.experimental.UtilityClass;

@UtilityClass
class Locations {
    private static int MAX_POSIX_PATH_LENGTH = 255;

    static String location(String name, Long id) {
        String sanitizedName = name.replaceAll("[^A-Za-z0-9]", "_");
        String idString = id.toString();
        if (sanitizedName.length() + idString.length() + 1 > MAX_POSIX_PATH_LENGTH) {
            sanitizedName = sanitizedName.substring(0, MAX_POSIX_PATH_LENGTH - idString.length() - 1);
        }

        return sanitizedName + '-' + idString;
    }

    static Long extractId(String location) {
        int separator = location.lastIndexOf('-');
        try {
            return Long.parseLong((separator < 0) ? location : location.substring(separator + 1));
        } catch (NumberFormatException e) {
            throw new CollectionNotFoundException();
        }
    }
}
