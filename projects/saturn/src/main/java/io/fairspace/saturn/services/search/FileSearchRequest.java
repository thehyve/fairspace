package io.fairspace.saturn.services.search;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter @Setter
public class FileSearchRequest extends SearchRequest {
    @NotBlank
    private String parentIRI;
}
