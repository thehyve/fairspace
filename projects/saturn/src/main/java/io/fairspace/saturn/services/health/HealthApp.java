package io.fairspace.saturn.services.health;

import spark.servlet.SparkApplication;

import static spark.Spark.get;

public class HealthApp implements SparkApplication {

    @Override
    public void init() {
        get("/api/health/", (req, res) -> "Welcome to FairSpace!");
    }
}
