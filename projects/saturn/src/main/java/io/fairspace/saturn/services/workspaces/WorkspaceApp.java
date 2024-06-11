package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.services.BaseApp;

import static jakarta.servlet.http.HttpServletResponse.SC_NO_CONTENT;
import static org.apache.jena.graph.NodeFactory.createURI;
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
        put("/", (req, res) -> {
            var ws = workspaceService.createWorkspace(mapper.readValue(req.body(), Workspace.class));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(ws);
        });

        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(workspaceService.listWorkspaces());
        });

        delete("/", (req, res) -> {
            workspaceService.deleteWorkspace(createURI(req.queryParams("workspace")));
            res.status(SC_NO_CONTENT);
            return "";
        });

        get("/users/", (req, res) -> {
            var users = workspaceService.getUsers(createURI(req.queryParams("workspace")));
            res.type(APPLICATION_JSON.asString());
            return mapper.writeValueAsString(users);
        });

        patch("/users/", (req, res) -> {
            var dto = mapper.readValue(req.body(), UserRoleDto.class);
            workspaceService.setUserRole(dto.getWorkspace(), dto.getUser(), dto.getRole());
            return "";
        });
    }
}
