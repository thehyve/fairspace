package io.fairspace.saturn.services.views;

import lombok.Value;

import java.util.List;

@Value
public class ViewDTO {
    String name;
    String title;
    List<ColumnDTO> columns;
}
