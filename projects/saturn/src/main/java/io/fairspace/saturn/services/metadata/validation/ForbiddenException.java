package io.fairspace.saturn.services.metadata.validation;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
