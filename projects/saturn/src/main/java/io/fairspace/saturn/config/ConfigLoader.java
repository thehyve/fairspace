package io.fairspace.saturn.config;

import java.io.File;
import java.io.IOException;

public class ConfigLoader {
    // TODO: Get rid of it. Use contexts instead
    public static final Config CONFIG = loadConfig();
    public static final SearchConfig SEARCH_CONFIG = loadSearchConfig();

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

    private static SearchConfig loadSearchConfig() {
        var settingsFile = new File("search.yaml");
        if (settingsFile.exists()) {
            try {
                return SearchConfig.MAPPER.readValue(settingsFile, SearchConfig.class);
            } catch (IOException e) {
                throw new RuntimeException("Error loading search configuration", e);
            }
        }
        return new SearchConfig();
    }
}
