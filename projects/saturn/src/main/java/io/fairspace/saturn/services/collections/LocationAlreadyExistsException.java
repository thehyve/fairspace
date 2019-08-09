package io.fairspace.saturn.services.collections;

public class LocationAlreadyExistsException extends RuntimeException {
    public LocationAlreadyExistsException() {
    }

    public LocationAlreadyExistsException(String location) {
        super("This location '" + location + "' is already taken");
    }

}
