package io.fairspace.saturn.services.views;

import lombok.*;

import javax.validation.constraints.*;
import java.util.*;

@Data
@Builder @NoArgsConstructor @AllArgsConstructor
public class ViewFilter {
    @NotBlank
    String field;
    List<Object> values;
    Object min;
    Object max;
    String prefix;
}
