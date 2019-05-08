package io.fairspace.saturn.services.metadata.validation;

import lombok.Value;

@Value
public class Violation {
    private String message;
    private String subject;
    private String predicate;
    private String value;
}
