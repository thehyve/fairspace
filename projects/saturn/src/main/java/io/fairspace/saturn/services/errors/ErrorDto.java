package io.fairspace.saturn.services.errors;

import ioinformarics.oss.jackson.module.jsonld.annotation.JsonldProperty;
import ioinformarics.oss.jackson.module.jsonld.annotation.JsonldType;
import lombok.Value;

import io.fairspace.saturn.vocabulary.FS;

@Value
@JsonldType(FS.ERROR_URI)
public class ErrorDto {
    @JsonldProperty(FS.ERROR_STATUS_URI)
    private int status;

    @JsonldProperty(FS.ERROR_MESSAGE_URI)
    private String message;

    @JsonldProperty(FS.ERROR_DETAILS_URI)
    private Object details;
}
