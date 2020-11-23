package io.fairspace.saturn.services.views;

import javax.validation.constraints.NotBlank;
import java.util.List;

public class CountRequest {

    @NotBlank
    String view;
    List<ViewFilter> filters;
}
