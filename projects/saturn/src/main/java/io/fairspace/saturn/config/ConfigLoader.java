package io.fairspace.saturn.config;

import java.io.IOException;

import lombok.extern.log4j.Log4j2;
import org.springframework.util.ResourceUtils;

@Log4j2
public class ConfigLoader {

    public static final ViewsConfig VIEWS_CONFIG = loadViewsConfig();

    private static ViewsConfig loadViewsConfig() {
        try {
            var settingsFile = ResourceUtils.getFile("classpath:views.yaml");
            if (settingsFile.exists()) {
                return ViewsConfig.MAPPER.readValue(settingsFile, ViewsConfig.class);
            }
        } catch (IOException e) {
            log.error("Error loading search configuration", e);
            throw new RuntimeException("Error loading search configuration", e);
        }
        return new ViewsConfig();
    }
}
