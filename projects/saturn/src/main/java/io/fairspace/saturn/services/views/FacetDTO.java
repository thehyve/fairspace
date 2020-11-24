package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.Config;
import lombok.Value;

import java.util.Map;

@Value
public class FacetDTO {
    String name;
    String title;
    Config.Search.ValueType type;
    Map<String, String> values;
    Long min;
    Long max;
}
