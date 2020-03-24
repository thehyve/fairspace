package io.fairspace.saturn.services.web;

import spark.servlet.SparkApplication;
import spark.staticfiles.StaticFilesConfiguration;
import spark.utils.IOUtils;

import java.io.FileInputStream;
import java.io.IOException;

import static spark.Spark.notFound;

public class StaticFilesApp implements SparkApplication {
    private static final String STATIC_FILES = "../mercury/build";

    private String index;

    @Override
    public void init() {
        try (var fis = new FileInputStream(STATIC_FILES + "/index.html")) {
            index = IOUtils.toString(fis);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        StaticFilesConfiguration.servletInstance.configureExternal(STATIC_FILES);
        notFound((req, res) -> {
            res.status(200);
            res.type("text/html");
            return index;
        });
    }
}
