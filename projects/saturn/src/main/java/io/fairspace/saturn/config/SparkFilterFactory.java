package io.fairspace.saturn.config;

import spark.servlet.SparkFilter;

import io.fairspace.saturn.services.features.FeaturesApp;
import io.fairspace.saturn.services.health.HealthApp;
import io.fairspace.saturn.services.maintenance.MaintenanceApp;
import io.fairspace.saturn.services.metadata.MetadataApp;
import io.fairspace.saturn.services.metadata.VocabularyApp;
import io.fairspace.saturn.services.search.SearchApp;
import io.fairspace.saturn.services.users.LogoutApp;
import io.fairspace.saturn.services.users.UserApp;
import io.fairspace.saturn.services.views.ViewApp;
import io.fairspace.saturn.services.workspaces.WorkspaceApp;

public class SparkFilterFactory {
    public static SparkFilter createSparkFilter(String apiPathPrefix, Services svc, Config config) {
        return new SaturnSparkFilter(
                new WorkspaceApp(apiPathPrefix + "/workspaces", svc.getWorkspaceService()),
                new MetadataApp(apiPathPrefix + "/metadata", svc.getMetadataService()),
                new ViewApp(apiPathPrefix + "/views", svc.getViewService(), svc.getQueryService()),
                new SearchApp(apiPathPrefix + "/search", svc.getSearchService(), svc.getQueryService()),
                new VocabularyApp(apiPathPrefix + "/vocabulary"),
                new UserApp(apiPathPrefix + "/users", svc.getUserService()),
                new FeaturesApp(apiPathPrefix + "/features", config.features),
                new HealthApp(apiPathPrefix + "/health", svc.getHealthService()),
                new MaintenanceApp(apiPathPrefix + "/maintenance", svc.getMaintenanceService()),
                new LogoutApp("/logout", svc.getUserService(), config));
    }
}
