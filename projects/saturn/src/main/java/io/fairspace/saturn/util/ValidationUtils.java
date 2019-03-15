package io.fairspace.saturn.util;

import spark.Request;

import static org.apache.jena.riot.system.IRIResolver.checkIRI;
import static org.eclipse.jetty.http.MimeTypes.getContentTypeWithoutCharset;

public class ValidationUtils {
    public static void validate(boolean condition, String message) {
        if (!condition) {
            throw new IllegalArgumentException(message);
        }
    }

    public static void validateIRI(String iri) {
        validate(!checkIRI(iri), "Invalid IRI: " + iri);
    }

    public static void validateContentType(Request request, String contentType) {
        if (!contentType.equals(getContentTypeWithoutCharset(request.contentType()))) {
            throw new UnsupportedMediaTypeException(contentType);
        }
    }
}
