package io.fairspace.saturn.services.projects;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

import io.fairspace.saturn.services.BaseApp;

import java.util.List;

public class ProjectsApp extends BaseApp {
    public ProjectsApp(String basePath) {
        super(basePath);
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(List.of(new Project("Project1"), new Project("Project2")));
        });
    }
}
