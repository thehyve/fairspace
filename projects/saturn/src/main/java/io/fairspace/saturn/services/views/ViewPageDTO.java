package io.fairspace.saturn.services.views;

import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Value @Builder
public class ViewPageDTO {
    /**
     * The key of every row is `${view}_${column}`.
     */
    @NonNull
    List<Map<String, Set<ValueDTO>>> rows;
    boolean hasNext;
    boolean timeout;
    Long totalCount;
    Long totalPages;
}
