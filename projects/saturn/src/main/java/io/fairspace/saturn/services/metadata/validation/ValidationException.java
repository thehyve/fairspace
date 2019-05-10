package io.fairspace.saturn.services.metadata.validation;

import lombok.Value;

import java.util.Set;

@Value
public class ValidationException extends RuntimeException {
    private final Set<Violation> violations;
}
