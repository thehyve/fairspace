package io.fairspace.saturn.services.views;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

@Getter @Setter
public class ViewRequest extends CountRequest {
    @NotBlank
    private String view;
    @Min(1)
    private Integer page;
    @Min(1)
    private Integer size;
}