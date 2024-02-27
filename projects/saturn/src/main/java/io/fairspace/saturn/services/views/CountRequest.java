package io.fairspace.saturn.services.views;

import java.util.List;
import javax.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CountRequest {
    @NotBlank
    private String view;

    private List<ViewFilter> filters;
}
