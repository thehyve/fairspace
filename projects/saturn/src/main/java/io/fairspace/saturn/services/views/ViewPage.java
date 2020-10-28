package io.fairspace.saturn.services.views;

import lombok.*;

import java.util.*;

@Data
@Builder
public class ViewPage {
    int totalPages;
    int totalElements;
    int page;
    int size;
    List<Map<String, Object>> rows;
}
