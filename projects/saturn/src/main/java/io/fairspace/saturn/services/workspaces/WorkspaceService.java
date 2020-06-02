package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import lombok.extern.slf4j.Slf4j;
import org.elasticsearch.ResourceNotFoundException;

import java.util.List;

import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.auth.RequestContext.getCurrentUser;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.time.Instant.now;
import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.graph.NodeFactory.createURI;

@Slf4j
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
            Workspace workspace = new Workspace(id, id, null, WorkspaceStatus.Active, null, null, Access.Manage);
            dao.write(workspace);
            permissions.createResource(workspace.getIri());
            return workspace;
        });
        audit("WS_CREATE", "workspace", id);
        return ws;
    }

    public Workspace getWorkspace(String iri) {
        return addPermissionsToObject(dao.read(Workspace.class, createURI(iri)));
    }

    public Workspace updateStatus(Workspace patch) {
        validate(patch.getIri() != null, "No IRI");
        validateIRI(patch.getIri().getURI());

        var w = dao.getDataset().calculateWrite(() -> {
            var workspace = getWorkspace(patch.getIri().getURI());
            if (workspace == null) {
                log.info("Workspace not found {}", patch.getIri());
                throw new ResourceNotFoundException(patch.getIri().getURI());
            }
            var user = getCurrentUser();
            if (!user.isAdmin()) {
                log.info("Not enough permissions to modify the status of a workspace {}", patch.getIri());
                throw new AccessDeniedException("Insufficient permissions to modify status of a workspace: " + patch.getIri().getURI());
            }
            if (patch.getStatus() != null) {
                workspace.setStatus(patch.getStatus());
                workspace.setStatusDateModified(now());
                workspace.setStatusModifiedBy(user.getIri());
            }

            workspace = dao.write(workspace);

            return workspace;
        });

        audit("WS_UPDATE_STATUS",
                "iri", w.getIri().getURI(),
                "status", w.getStatus().name());

        return w;
    }

    private Workspace addPermissionsToObject(Workspace w) {
        if (w != null) {
            w.setAccess(permissions.getPermission(w.getIri()));
            if(w.getAccess() == Access.None) {
                return null;
            }
        }
        return w;
    }
}
