package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.DAO;

import java.util.List;

public class WorkspaceService {
    private final DAO dao;

    public WorkspaceService(DAO dao) {
        this.dao = dao;
    }

    public List<Workspace> listWorkspaces() {
        return dao.getDataset().calculateRead(() -> dao.list(Workspace.class));
    }

    public Workspace createWorkspace(String id) {
        return dao.getDataset().calculateWrite(() -> dao.write(new Workspace(id)));
    }
}
