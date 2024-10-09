package io.fairspace.saturn.controller.dto;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;

@Value
@Builder
public class SearchResultDto {
    @NonNull
    String id;

    String label;
    String type;
    String comment;
}
