package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import lombok.Value;

@Value
public class ColumnDTO {
    String name;
    String title;
    ViewsConfig.ColumnType type;
    Integer displayIndex;
}
