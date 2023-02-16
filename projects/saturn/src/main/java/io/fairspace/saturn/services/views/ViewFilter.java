package io.fairspace.saturn.services.views;

import com.fasterxml.jackson.annotation.*;
import lombok.*;

import javax.validation.constraints.*;
import java.util.*;

@Data
@Builder @NoArgsConstructor @AllArgsConstructor
public class ViewFilter {
    /**
     * Field name of the shape `${view}_${column}`.
     */
    @NotBlank
    String field;
    List<Object> values;
    Object min;
    Object max;
    Boolean booleanValue;
    String prefix;
    /**
     * Used internally for filtering on resource location.
     */
    @JsonIgnore
    List<String> prefixes;
}
