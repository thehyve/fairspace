package io.fairspace.saturn.services.projects;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class ProjectsApp extends BaseApp {
    private final ProjectsService projectsService;

    public ProjectsApp(String basePath, ProjectsService projectsService) {
        super(basePath);
        this.projectsService = projectsService;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(projectsService.listProjects());
        });
    }
}
