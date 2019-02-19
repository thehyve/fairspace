package io.fairspace.saturn.services.collections;

public class CollectionAccessDenied extends RuntimeException {
    public CollectionAccessDenied(String iri) {
        super("Insufficient permissions for collection " + iri);
    }
}
