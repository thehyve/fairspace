package io.fairspace.saturn.config;

import lombok.extern.log4j.*;

import java.io.File;
import java.io.IOException;

@Log4j2
public class ConfigLoader {
    // TODO: Get rid of it. Use contexts instead
    public static final Config CONFIG = loadConfig();
    public static final ViewsConfig VIEWS_CONFIG = loadViewsConfig();

    private static Config loadConfig() {
        var settingsFile = new File("application.yaml");
        if (settingsFile.exists()) {
            try {
                return Config.MAPPER.readValue(settingsFile, Config.class);
            } catch (IOException e) {
                throw new RuntimeException("Error loading configuration", e);
            }
        }
        return new Config();
    }

    private static ViewsConfig loadViewsConfig() {
        var settingsFile = new File("views.yaml");
        if (settingsFile.exists()) {
            try {
                return ViewsConfig.MAPPER.readValue(settingsFile, ViewsConfig.class);
            } catch (IOException e) {
                log.error("Error loading search configuration", e);
                throw new RuntimeException("Error loading search configuration", e);
            }
        }
        return new ViewsConfig();
    }
}
