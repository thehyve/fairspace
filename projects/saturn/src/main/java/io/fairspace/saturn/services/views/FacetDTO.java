package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.Config;
import lombok.Value;

import java.util.List;

@Value
public class FacetDTO {
    String name;
    String title;
    Config.Search.ValueType type;
    List<ValueDTO> values;
    Long min;
    Long max;
}
