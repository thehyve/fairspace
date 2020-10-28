package io.fairspace.saturn.config;

import io.fairspace.saturn.services.features.FeaturesApp;
import io.fairspace.saturn.services.health.HealthApp;
import io.fairspace.saturn.services.metadata.MetadataApp;
import io.fairspace.saturn.services.metadata.VocabularyApp;
import io.fairspace.saturn.services.services.ServicesApp;
import io.fairspace.saturn.services.users.UserApp;
import io.fairspace.saturn.services.views.*;
import io.fairspace.saturn.services.web.StaticFilesApp;
import io.fairspace.saturn.services.workspaces.WorkspaceApp;
import spark.servlet.*;

import javax.servlet.Filter;
import java.util.*;
import java.util.stream.*;

public class SparkFilterFactory {
    public static Filter createSparkFilter(String apiPathPrefix, Services svc, Config config) {
        SparkApplication[] apps = Stream.of(
                new WorkspaceApp(apiPathPrefix + "/workspaces", svc.getWorkspaceService()),
                new MetadataApp(apiPathPrefix + "/metadata", svc.getMetadataService()),
                svc.getViewService() == null ? null : new ViewApp(apiPathPrefix + "/views", svc.getViewService()),
                new VocabularyApp(apiPathPrefix + "/vocabulary"),
                new UserApp(apiPathPrefix + "/users", svc.getUserService()),
                new ServicesApp(apiPathPrefix + "/services", config.services),
                new FeaturesApp(apiPathPrefix + "/features", config.features),
                new HealthApp(apiPathPrefix + "/health"),
                new StaticFilesApp()
        ).filter(Objects::nonNull).toArray(SparkApplication[]::new);
        return new SaturnSparkFilter(apps);
    }
}
