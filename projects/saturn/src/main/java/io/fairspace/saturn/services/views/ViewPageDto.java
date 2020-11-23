package io.fairspace.saturn.services.views;

import lombok.Value;

import java.util.List;
import java.util.Map;

@Value
public class ViewPageDto {
    List<Map<String, Object>> rows;
    boolean hasNext;
    boolean timeout;
}