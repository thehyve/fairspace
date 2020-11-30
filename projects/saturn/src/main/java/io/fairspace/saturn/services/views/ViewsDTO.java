package io.fairspace.saturn.services.views;

import lombok.Value;

import java.util.List;

@Value
public class ViewsDTO {
    List<FacetDTO> facets;
    List<ViewDTO> views;
}
