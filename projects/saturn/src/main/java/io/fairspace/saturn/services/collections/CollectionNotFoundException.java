package io.fairspace.saturn.services.collections;

public class CollectionNotFoundException extends RuntimeException {
    public CollectionNotFoundException(String iri) {
        super("Collection not found: " + iri);
    }
}
