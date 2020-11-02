package io.fairspace.saturn.services.views;

import lombok.*;

import java.util.*;

@Data
@Builder
public class ViewPage {
    private int totalPages;
    private int totalElements;
    private int page;
    private int size;
    @Singular
    private List<Map<String, Object>> rows;
}