package io.fairspace.saturn.services.metadata.validation;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Set;

@RequiredArgsConstructor
@Getter
public class ValidationException extends RuntimeException {
    private final Set<Violation> violations;
}
