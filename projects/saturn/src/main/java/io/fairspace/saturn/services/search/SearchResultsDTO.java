package io.fairspace.saturn.services.search;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value @Builder
public class SearchResultsDTO {
    List<SearchResultDTO> results;
    String query;
}
