package io.fairspace.saturn.services.health;

import lombok.AllArgsConstructor;
import spark.servlet.SparkApplication;

import static spark.Spark.get;

@AllArgsConstructor
public class HealthApp implements SparkApplication {
    private final String pathPrefix;

    @Override
    public void init() {
        get(pathPrefix + "/health/", (req, res) -> "Welcome to FairSpace!");
    }
}
