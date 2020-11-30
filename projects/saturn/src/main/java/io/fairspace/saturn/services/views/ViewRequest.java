package io.fairspace.saturn.services.views;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Min;

@Getter @Setter
public class ViewRequest extends CountRequest {
    @Min(1)
    private Integer page;
    @Min(1)
    private Integer size;
}