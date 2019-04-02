package io.fairspace.saturn.util;

public class UnsupportedMediaTypeException extends IllegalArgumentException {
    public UnsupportedMediaTypeException(String expectedType) {
        super("Invalid Content-Type header. Expected " + expectedType);
    }
}
