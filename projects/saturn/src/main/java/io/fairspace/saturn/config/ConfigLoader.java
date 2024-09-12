package io.fairspace.saturn.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import lombok.extern.log4j.Log4j2;
import org.springframework.util.ResourceUtils;

import java.io.IOException;

@Log4j2
public class ConfigLoader {
    // TODO: Get rid of it. Use contexts instead
    public static final Config CONFIG = loadConfig();
    public static final ViewsConfig VIEWS_CONFIG = loadViewsConfig();

    private static Config loadConfig() {
        try {
            var settingsFile = ResourceUtils.getFile("classpath:saturn-config.yaml");
            if (settingsFile.exists()) {
                return new ObjectMapper(new YAMLFactory()).readValue(settingsFile, Config.class);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error loading configuration", e);
        }
        return new Config();
}

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
