package io.fairspace.saturn.config;

import io.fairspace.saturn.config.properties.KeycloakClientProperties;
import io.fairspace.saturn.services.search.SearchApp;
import io.fairspace.saturn.services.users.LogoutApp;

public class SparkFilterFactory {
    public static SaturnSparkFilter createSparkFilter(
            String apiPathPrefix, Services svc, KeycloakClientProperties keycloakClientProperties, String publicUrl) {
        return new SaturnSparkFilter(
                new SearchApp(apiPathPrefix + "/search", svc.getSearchService(), svc.getFileSearchService()),
                new LogoutApp("/logout", svc.getUserService(), keycloakClientProperties, publicUrl));
    }
}
