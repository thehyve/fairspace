package io.fairspace.saturn.services.views;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.List;

@Data
public class CountRequest {
    @NotBlank
    private String view;
    private List<ViewFilter> filters;
}
