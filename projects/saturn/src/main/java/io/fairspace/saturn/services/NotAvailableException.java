package io.fairspace.saturn.services;

public class NotAvailableException extends RuntimeException {
    public NotAvailableException() {}

    public NotAvailableException(String message) {
        super(message);
    }

    public NotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }

    public NotAvailableException(Throwable cause) {
        super(cause);
    }
}
