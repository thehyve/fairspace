package io.fairspace.saturn.services.views;

import java.util.List;

import com.fasterxml.jackson.annotation.*;
import lombok.Value;

import io.fairspace.saturn.config.*;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.*;

@Value
@JsonInclude(NON_NULL)
public class FacetDTO {
    String name;
    String title;
    ViewsConfig.ColumnType type;
    List<ValueDTO> values;
    Boolean booleanValue;
    Object min;
    Object max;
}
