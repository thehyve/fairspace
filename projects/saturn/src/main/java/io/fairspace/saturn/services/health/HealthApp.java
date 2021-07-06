package io.fairspace.saturn.services.health;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class HealthApp extends BaseApp {
    private final HealthService healthService;

    public HealthApp(String basePath, HealthService healthService) {
        super(basePath);
        this.healthService = healthService;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            Health health = healthService.getHealth();
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(health);
        });
    }
}
