package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.Config;
import lombok.Value;

@Value
public class ColumnDTO {
    String name;
    String title;
    Config.Search.ValueType type;
}
