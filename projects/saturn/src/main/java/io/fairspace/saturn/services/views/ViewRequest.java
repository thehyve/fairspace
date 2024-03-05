package io.fairspace.saturn.services.views;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ViewRequest extends CountRequest {
    @Min(1)
    private Integer page;

    @Min(1)
    private Integer size;

    private Boolean includeCounts;

    public boolean includeCounts() {
        return includeCounts != null && includeCounts;
    }

    private Boolean includeJoinedViews;

    public boolean includeJoinedViews() {
        return includeJoinedViews != null && includeJoinedViews;
    }
}
