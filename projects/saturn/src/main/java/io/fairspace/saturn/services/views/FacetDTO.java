package io.fairspace.saturn.services.views;

import com.fasterxml.jackson.annotation.*;
import io.fairspace.saturn.config.*;
import lombok.Value;

import java.util.List;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.*;

@Value @JsonInclude(NON_NULL)
public class FacetDTO {
    String name;
    String title;
    ViewsConfig.ColumnType type;
    List<ValueDTO> values;
    Boolean booleanValue;
    Object min;
    Object max;
}
