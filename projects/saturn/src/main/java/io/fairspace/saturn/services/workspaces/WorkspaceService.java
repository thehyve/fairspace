package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.vocabulary.RDF;

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
        var ws = dao.getDataset().calculateWrite(() -> dao.write(new Workspace(id, id, null)));
        audit("WS_CREATE", "workspace", id);
        return ws;
    }

    public Workspace getWorkspace(String id) {
        return dao.getDataset().calculateRead(() ->
                dao.getDataset().getDefaultModel().listResourcesWithProperty(FS.id, id)
                        .filterKeep(r -> r.hasProperty(RDF.type, FS.Workspace))
                        .filterDrop(r -> r.hasProperty(FS.dateDeleted))
                        .nextOptional()
                        .map(r -> dao.read(Workspace.class, r.asNode()))
                        .orElse(null));
    }
}
