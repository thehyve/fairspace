package io.fairspace.saturn.controller.dto;

import java.util.List;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SearchResultsDto {
    List<SearchResultDto> results;
    String query;
}
