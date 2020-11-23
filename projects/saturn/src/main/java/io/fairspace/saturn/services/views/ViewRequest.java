package io.fairspace.saturn.services.views;

import lombok.Data;
import lombok.Value;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

@Value
public class ViewRequest extends CountRequest {
    @NotBlank
    String view;
    @Min(1)
    Integer page;
    @Min(1)
    Integer size;
}