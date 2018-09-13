package io.fairspace.neptune.service;

import io.fairspace.neptune.web.CollectionNotFoundException;
import lombok.experimental.UtilityClass;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

@UtilityClass
class Locations {
    static String location(String name, Long id) {
        try {
            return URLEncoder.encode(name, "US-ASCII") + "-" + id;
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
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
