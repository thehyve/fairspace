package io.fairspace.saturn.config;

import io.fairspace.saturn.services.health.HealthApp;
import io.fairspace.saturn.services.metadata.MetadataApp;
import io.fairspace.saturn.services.metadata.VocabularyApp;
import io.fairspace.saturn.services.services.ServicesApp;
import io.fairspace.saturn.services.users.UserApp;
import io.fairspace.saturn.services.web.StaticFilesApp;
import io.fairspace.saturn.services.workspaces.WorkspaceApp;

import javax.servlet.Filter;

public class SparkFilterFactory {
    public static Filter createSparkFilter(String apiPathPrefix, Services svc, Config config) {
        return new SaturnSparkFilter(
                new WorkspaceApp(apiPathPrefix + "/workspaces", svc.getWorkspaceService()),
                new MetadataApp(apiPathPrefix + "/metadata", svc.getMetadataService()),
                new VocabularyApp(apiPathPrefix + "/vocabulary"),
                new UserApp(apiPathPrefix + "/users", svc.getUserService()),
                new ServicesApp(apiPathPrefix + "/services", config.services),
                new HealthApp(apiPathPrefix + "/health"),
                new StaticFilesApp());
    }
}
