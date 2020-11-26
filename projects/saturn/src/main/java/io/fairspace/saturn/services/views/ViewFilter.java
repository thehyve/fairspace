package io.fairspace.saturn.services.views;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
public class ViewFilter {
    @NotBlank
    String field;
    List<Object> values = new ArrayList<>();
    Object min;
    Object max;
}
