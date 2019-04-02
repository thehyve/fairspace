package io.fairspace.saturn.services;

/**
 * Can represent an error that happened during parsing of HTTP request body, etc
 */
public class PayloadParsingException extends RuntimeException {
    public PayloadParsingException() {
    }

    public PayloadParsingException(String message) {
        super(message);
    }

    public PayloadParsingException(String message, Throwable cause) {
        super(message, cause);
    }

    public PayloadParsingException(Throwable cause) {
        super(cause);
    }

    public PayloadParsingException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
