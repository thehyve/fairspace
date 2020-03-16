package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.DAO;

import java.util.List;

import static io.fairspace.saturn.audit.Audit.audit;

public class WorkspaceService {
    private final DAO dao;

    public WorkspaceService(DAO dao) {
        this.dao = dao;
    }

    public List<Workspace> listWorkspaces() {
        return dao.getDataset().calculateRead(() -> dao.list(Workspace.class));
    }

    public Workspace createWorkspace(String id) {
        var ws = dao.getDataset().calculateWrite(() -> dao.write(new Workspace(id)));
        audit("WS_CREATE", "workspace", id);
        return ws;
    }
}
