package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.vocabulary.RDF;

import java.util.List;

import static io.fairspace.saturn.audit.Audit.audit;
import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.toList;

public class WorkspaceService {
    private final DAO dao;
    private final PermissionsService permissions;

    public WorkspaceService(DAO dao, PermissionsService permissions) {
        this.dao = dao;
        this.permissions = permissions;
    }

    public List<Workspace> listWorkspaces() {
        return dao.getDataset().calculateRead(() -> {
            var workspaces = dao.list(Workspace.class);
            var iris = workspaces.stream().map(Workspace::getIri).collect(toList());
            var userPermissions = permissions.getPermissions(iris);
            return workspaces.stream()
                    .peek(c -> c.setAccess(userPermissions.get(c.getIri())))
                    .sorted(comparing(Workspace::getName))
                    .collect(toList());
        });
    }

    public Workspace createWorkspace(String id) {
        var ws = dao.getDataset().calculateWrite(() -> {
            Workspace workspace = new Workspace(id, id, null, WorkspaceStatus.Active, Access.Manage);
            dao.write(workspace);
            permissions.createResource(workspace.getIri());
            return workspace;
        });
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
