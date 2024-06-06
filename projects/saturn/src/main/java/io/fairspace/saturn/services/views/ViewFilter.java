package io.fairspace.saturn.services.views;

import java.util.*;

import com.fasterxml.jackson.annotation.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    Boolean numericValue;
    String prefix;
    /**
     * Used internally for filtering on resource location.
     */
    @JsonIgnore
    List<String> prefixes;
}
