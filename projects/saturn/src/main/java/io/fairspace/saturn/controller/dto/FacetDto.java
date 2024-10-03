package io.fairspace.saturn.controller.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.fairspace.saturn.config.ViewsConfig;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@JsonInclude(NON_NULL)
public record FacetDto(
        String name,
        String title,
        ViewsConfig.ColumnType type,
        List<ValueDto> values,
        Boolean booleanValue,
        Object min,
        Object max) {}