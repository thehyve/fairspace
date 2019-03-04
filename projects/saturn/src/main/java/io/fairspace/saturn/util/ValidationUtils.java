package io.fairspace.saturn.util;

import static org.apache.jena.riot.system.IRIResolver.checkIRI;

public class ValidationUtils {
    public static void validate(boolean condition, String message) {
        if (!condition) {
            throw new IllegalArgumentException(message);
        }
    }

    public static void validateIRI(String iri) {
        validate(!checkIRI(iri), "Invalid IRI: " + iri);
    }
}
