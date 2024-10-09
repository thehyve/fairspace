package io.fairspace.saturn.config;

import io.fairspace.saturn.config.properties.KeycloakClientProperties;
import io.fairspace.saturn.services.users.LogoutApp;

public class SparkFilterFactory {
    public static SaturnSparkFilter createSparkFilter(
            String apiPathPrefix, Services svc, KeycloakClientProperties keycloakClientProperties, String publicUrl) {
        return new SaturnSparkFilter(
                new LogoutApp("/logout", svc.getUserService(), keycloakClientProperties, publicUrl));
    }
}
