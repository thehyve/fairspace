package io.fairspace.saturn.services.search;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LookupSearchRequest extends SearchRequest {
    private String resourceType;
}
