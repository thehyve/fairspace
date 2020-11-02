package io.fairspace.saturn.services.views;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ViewDTO {
    String name;
    String title;
    List<ColumnDTO> columns;
}
