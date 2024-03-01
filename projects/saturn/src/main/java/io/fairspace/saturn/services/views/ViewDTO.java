package io.fairspace.saturn.services.views;

import java.util.List;

import lombok.Value;

@Value
public class ViewDTO {
    String name;
    String title;
    List<ColumnDTO> columns;
}
