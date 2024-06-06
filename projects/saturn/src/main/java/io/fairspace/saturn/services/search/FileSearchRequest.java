package io.fairspace.saturn.services.search;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileSearchRequest extends SearchRequest {
    @NotBlank
    private String parentIRI;
}
