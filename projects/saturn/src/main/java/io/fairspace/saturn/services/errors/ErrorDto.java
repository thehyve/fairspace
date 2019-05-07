package io.fairspace.saturn.services.errors;

import lombok.Value;

@Value
public class ErrorDto {
    private int status;
    private String message;
    private Object info;
}
