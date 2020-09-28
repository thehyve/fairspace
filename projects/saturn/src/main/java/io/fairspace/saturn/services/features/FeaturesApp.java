package io.fairspace.saturn.services.features;

import io.fairspace.saturn.config.Feature;
import io.fairspace.saturn.services.BaseApp;

import java.util.Set;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class FeaturesApp extends BaseApp {
    private final Set<Feature> features;

    public FeaturesApp(String basePath, Set<Feature> features) {
        super(basePath);
        this.features = features;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(features);
        });
    }
}
