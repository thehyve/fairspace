package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.*;

public class WorkspaceApp extends BaseApp {
    private final WorkspaceService workspaceService;

    public WorkspaceApp(String basePath, WorkspaceService workspaceService) {
        super(basePath);
        this.workspaceService = workspaceService;
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(workspaceService.listWorkspaces());
        });

        put("/:id", (req, res) -> {
            var ws = workspaceService.createWorkspace(req.params("id"));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(ws);
        });

        patch("/:id/status", (req, res) -> {
            var workspace = mapper.readValue(req.body(), Workspace.class);
            var result = workspaceService.updateStatus(workspace);
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(result);
        });
    }
}
