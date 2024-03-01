package io.fairspace.saturn.services.search;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SearchResultsDTO {
    List<SearchResultDTO> results;
    String query;
}
