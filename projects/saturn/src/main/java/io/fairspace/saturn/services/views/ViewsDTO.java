package io.fairspace.saturn.services.views;

import lombok.Value;

import java.util.List;

@Value
public class ViewsDTO {
    final List<FacetDTO> facets;
    final List<ViewDTO> views;
}
