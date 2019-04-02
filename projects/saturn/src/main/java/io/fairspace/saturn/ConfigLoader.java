package io.fairspace.saturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import java.io.File;
import java.io.IOException;

public class ConfigLoader {
    public static final Config CONFIG = loadConfig();

    private static Config loadConfig() {
        var settingsFile = new File("application.yaml");
        if (settingsFile.exists()) {
            try {
                return new ObjectMapper(new YAMLFactory()).readValue(settingsFile, Config.class);
            } catch (IOException e) {
                throw new RuntimeException("Error loading configuration", e);
            }
        }
        return new Config();
    }
}
