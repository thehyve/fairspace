package io.fairspace.saturn.services.views;
import lombok.Data;
import lombok.Value;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;

@Data
public class ViewRequest extends CountRequest {
    @NotBlank
    private String view;
    @Min(1)
    private Integer page;
    @Min(1)
    private Integer size;
}