package io.fairspace.saturn.services.views;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Value;

@Value
public class ViewDTO {
    String name;
    String title;
    List<ColumnDTO> columns;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    Long maxDisplayCount;
}
