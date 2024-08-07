package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.ViewsConfig;
import lombok.Value;

@Value
public class ViewConfigDto {

    long maxDisplayCount;

    public static ViewConfigDto from(ViewsConfig.View config) {
        return new ViewConfigDto(config.maxDisplayCount);
    }

}

