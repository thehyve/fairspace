package io.fairspace.saturn.services.services;

import java.util.Map;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class ServicesApp extends BaseApp {
    private final Map<String, String> services;

    public ServicesApp(String basePath, Map<String, String> services) {
        super(basePath);
        this.services = services;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(services);
        });
    }
}
