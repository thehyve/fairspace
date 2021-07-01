package io.fairspace.saturn.services.health;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class HealthApp extends BaseApp {
    public HealthApp(String basePath) {
        super(basePath);
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(new HealthStatus("OK"));
        });
    }
}
