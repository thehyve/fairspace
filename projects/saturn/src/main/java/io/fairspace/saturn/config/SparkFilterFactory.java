package io.fairspace.saturn.config;

import io.fairspace.saturn.config.properties.KeycloakClientProperties;
import io.fairspace.saturn.services.maintenance.MaintenanceApp;
import io.fairspace.saturn.services.search.SearchApp;
import io.fairspace.saturn.services.users.LogoutApp;
import io.fairspace.saturn.services.users.UserApp;

public class SparkFilterFactory {
    public static SaturnSparkFilter createSparkFilter(
            String apiPathPrefix, Services svc, KeycloakClientProperties keycloakClientProperties, String publicUrl) {
        return new SaturnSparkFilter(
                new SearchApp(apiPathPrefix + "/search", svc.getSearchService(), svc.getFileSearchService()),
                new UserApp(apiPathPrefix + "/users", svc.getUserService()),
                new MaintenanceApp(apiPathPrefix + "/maintenance", svc.getMaintenanceService()),
                new LogoutApp("/logout", svc.getUserService(), keycloakClientProperties, publicUrl));
    }
}
