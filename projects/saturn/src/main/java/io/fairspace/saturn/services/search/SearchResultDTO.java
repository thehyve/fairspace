package io.fairspace.saturn.services.search;

import lombok.Builder;
import lombok.NonNull;
import lombok.Value;

@Value @Builder
public class SearchResultDTO {
    @NonNull
    String id;
    String label;
    String type;
    String comment;
}
