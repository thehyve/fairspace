package io.fairspace.saturn.services.views;

import lombok.Data;
import lombok.Singular;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

@Data
public class ViewFilter {
    @NotBlank
    String field;
    @Singular
    List<Object> values = new ArrayList<>();
    Object rangeStart;
    Object rangeEnd;
}
