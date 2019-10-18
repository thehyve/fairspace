package io.fairspace.saturn.util;

import java.util.Collection;

public class UnsupportedMediaTypeException extends IllegalArgumentException {
    public UnsupportedMediaTypeException(String expectedType) {
        super("Invalid Content-Type header. Expected " + expectedType);
    }

    public UnsupportedMediaTypeException(Collection<String> expectedTypes) {
        super("Invalid Content-Type header. Expected one of " + String.join(",", expectedTypes));
    }

}
