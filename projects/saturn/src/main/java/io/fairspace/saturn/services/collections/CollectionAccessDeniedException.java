package io.fairspace.saturn.services.collections;

public class CollectionAccessDeniedException extends RuntimeException {
    public CollectionAccessDeniedException(String iri) {
        super("Insufficient permissions for collection " + iri);
    }
}
