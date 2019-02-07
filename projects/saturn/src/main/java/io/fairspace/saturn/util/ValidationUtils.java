package io.fairspace.saturn.util;

public class ValidationUtils {
    public static void validate(boolean condition, String message) {
        if (!condition) {
            throw new IllegalArgumentException(message);
        }
    }
}
