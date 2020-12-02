package io.fairspace.saturn.services.views;

import lombok.*;

import java.util.List;
import java.util.Map;

@Value @Builder
public class ViewPageDTO {
    @NonNull
    List<Map<String, Object>> rows;
    boolean hasNext;
    boolean timeout;
}
