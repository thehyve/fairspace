package io.fairspace.saturn.services.health;

import io.fairspace.saturn.services.BaseApp;

import static spark.Spark.get;

public class HealthApp extends BaseApp {
    public HealthApp(String basePath) {
        super(basePath);
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> "Welcome to FairSpace!");
    }
}
