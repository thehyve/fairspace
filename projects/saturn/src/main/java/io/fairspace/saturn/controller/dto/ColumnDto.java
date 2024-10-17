package io.fairspace.saturn.controller.dto;

import io.fairspace.saturn.config.ViewsConfig;

public record ColumnDto(String name, String title, ViewsConfig.ColumnType type, Integer displayIndex) {}
