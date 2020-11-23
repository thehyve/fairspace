package io.fairspace.saturn.services.views;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import java.util.List;

@Getter @Setter
public class CountRequest {
    @NotBlank
    private String view;
    private List<ViewFilter> filters;
}
