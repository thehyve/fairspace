package io.fairspace.saturn.services.views;

import lombok.Value;

import io.fairspace.saturn.config.*;

@Value
public class ColumnDTO {
    String name;
    String title;
    ViewsConfig.ColumnType type;
    Integer displayIndex;
}
