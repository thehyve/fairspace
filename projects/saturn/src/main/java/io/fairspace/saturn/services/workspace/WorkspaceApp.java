package io.fairspace.saturn.services.workspace;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.fairspace.saturn.Config;
import io.fairspace.saturn.services.BaseApp;

import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;
import static spark.Spark.get;

public class WorkspaceApp extends BaseApp {
    private final String workspaceInfo;

    public WorkspaceApp(String basePath, Config.Workspace workspace) {
        super(basePath);
        try {
            this.workspaceInfo = mapper.writeValueAsString(workspace);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void initApp() {
        get("/", (req, res) -> {
            res.type(APPLICATION_JSON.asString());
            return workspaceInfo;
        });
    }
}
