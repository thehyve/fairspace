package io.fairspace.saturn.services.metadata.validation;

import java.util.Set;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class ValidationException extends RuntimeException {
    private final Set<Violation> violations;
}
