package io.fairspace.saturn.services.views;

import lombok.*;

import java.util.*;

import static io.fairspace.saturn.config.ViewsConfig.*;

@Data @Builder
public class Table {
    @Data @Builder
    public static class ColumnDefinition {
        String name;
        ColumnType type;
    }

    public static ColumnDefinition idColumn() {
        return idColumn(null);
    }

    public static ColumnDefinition idColumn(String prefix) {
        return ColumnDefinition.builder()
                .name(prefix == null ? "id" : prefix.toLowerCase() + "_id")
                .type(ColumnType.Identifier)
                .build();
    }

    public static ColumnDefinition valueColumn(String name, ColumnType type) {
        return ColumnDefinition.builder()
                .name(name.toLowerCase())
                .type(type)
                .build();
    }

    String name;
    List<ColumnDefinition> columns;

    public ColumnDefinition getColumn(String name) {
        return columns.stream().filter(column -> column.getName().equals(name.toLowerCase())).findFirst().orElse(null);
    }
}
