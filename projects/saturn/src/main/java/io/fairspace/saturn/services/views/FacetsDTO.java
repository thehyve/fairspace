package io.fairspace.saturn.services.views;

import java.util.List;

import lombok.Value;

@Value
public class FacetsDTO {
    List<FacetDTO> facets;
}
