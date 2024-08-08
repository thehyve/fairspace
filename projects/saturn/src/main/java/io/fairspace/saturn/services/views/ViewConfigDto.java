package io.fairspace.saturn.services.views;

import lombok.Value;

import io.fairspace.saturn.config.ViewsConfig;

@Value
public class ViewConfigDto {

    long maxDisplayCount;

    public static ViewConfigDto from(ViewsConfig.View config) {
        return new ViewConfigDto(config.maxDisplayCount);
    }
}
