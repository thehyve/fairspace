package io.fairspace.saturn.services.web;

import lombok.SneakyThrows;
import spark.servlet.SparkApplication;

import java.io.File;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.apache.commons.io.FileUtils.readFileToString;
import static spark.Spark.externalStaticFileLocation;
import static spark.Spark.notFound;

public class StaticFilesApp implements SparkApplication {
    private static final String STATIC_FILES = "../mercury/build";

    private String index;

    @Override
    @SneakyThrows
    public void init() {
        externalStaticFileLocation(STATIC_FILES);

        index = readFileToString(new File(STATIC_FILES + "/index.html"), UTF_8);

        notFound((req, res) -> {
            if (req.pathInfo().startsWith("/api/")) {
                return null;
            }
            res.status(200);
            res.type("text/html");
            return index;
        });
    }
}
