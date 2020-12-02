package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import lombok.Value;

import java.util.List;

@Value
public class FacetDTO {
    String name;
    String title;
    ViewsConfig.ColumnType type;
    List<ValueDTO> values;
    Object min;
    Object max;
}
