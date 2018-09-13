package io.fairspace.neptune.model;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String s) {
        super(s);
    }

    public UnauthorizedException(String s, Exception e) {
        super(s, e);
    }

}
