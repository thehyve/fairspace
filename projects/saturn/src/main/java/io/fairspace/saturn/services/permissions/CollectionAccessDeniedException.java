package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.services.AccessDeniedException;
import lombok.Getter;
import lombok.NonNull;

@Getter
public class CollectionAccessDeniedException extends AccessDeniedException {
    @NonNull
    String iri;

    public CollectionAccessDeniedException(String message, @NonNull String iri) {
        super(message);
        this.iri = iri;
    }

    public CollectionAccessDeniedException(String message, @NonNull String iri, Throwable cause) {
        super(message, cause);
        this.iri = iri;
    }
}
