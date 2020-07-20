package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.base.Strings.isNullOrEmpty;
import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.auth.RequestContext.isAdmin;
import static io.fairspace.saturn.rdf.ModelUtils.getResourceProperties;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.time.Instant.now;
import static java.util.stream.Collectors.toList;

@Slf4j
public class WorkspaceService {
    private final Transactions tx;

    public WorkspaceService(Transactions tx) {
        this.tx = tx;
    }

    public List<Workspace> listWorkspaces() {
        return tx.calculateRead(ds -> {
            var m = ds.getDefaultModel();
            var user = m.wrapAsResource(getUserURI());
            return new DAO(ds).list(Workspace.class)
                    .stream()
                    .peek(ws -> {
                        var res = m.wrapAsResource(ws.getIri());
                        ws.setCanManage(isAdmin() || res.hasProperty(FS.manage, user));
                        ws.setCanCollaborate(ws.isCanManage() || res.hasProperty(FS.member, user));
                    }).collect(toList());
        });
    }

    public Workspace getWorkspace(Node iri) {
        return tx.calculateRead(ds -> {
            var ws = new DAO(ds).read(Workspace.class, iri);
            if (ws == null) {
                return null;
            }
            var res = ds.getDefaultModel().wrapAsResource(ws.getIri());
            var user = ds.getDefaultModel().wrapAsResource(getUserURI());
            ws.setCanManage(isAdmin() || res.hasProperty(FS.manage, user));
            ws.setCanCollaborate(ws.isCanManage() || res.hasProperty(FS.member, user));
            return ws;
        });
    }

    public Workspace createWorkspace(Workspace ws) {
        if (!isAdmin()) {
            throw new AccessDeniedException();
        }
        validate(ws.getIri() == null, "IRI must be empty");
        validate(!isNullOrEmpty(ws.getName()), "Please specify workspace name");
        if (ws.getDescription() == null) {
            ws.setDescription("");
        }

        ws.setStatus(WorkspaceStatus.Active);
        ws.setStatusDateModified(now());
        ws.setStatusModifiedBy(getUserURI());

        var created = tx.calculateWrite(ds -> {
            var workspace = new DAO(ds).write(ws);
            var m = ds.getDefaultModel();
            m.wrapAsResource(workspace.getIri()).addProperty(FS.manage, m.wrapAsResource(getUserURI()));
            workspace.setCanManage(true);
            workspace.setCanCollaborate(true);
            return workspace;
        });

        audit("WS_CREATE", "workspace", created.getIri());
        return created;
    }

    public Workspace updateWorkspace(Workspace patch) {
        validate(patch.getIri() != null, "No IRI provided");

        var statusUpdated = new boolean[] {false};

        var updated = tx.calculateWrite(ds -> {
            var dao = new DAO(ds);
            var workspace = dao.read(Workspace.class, patch.getIri());
            if (workspace == null) {
                throw new AccessDeniedException();
            }

            var m = ds.getDefaultModel();
            var workspaceResource = m.wrapAsResource(patch.getIri());
            var canManage = workspaceResource.hasProperty(FS.manage, m.wrapAsResource(getUserURI())) || isAdmin();
            if (!canManage) {
                throw new AccessDeniedException();
            }

            if (patch.getStatus() != null && patch.getStatus() != workspace.getStatus()) {
                workspace.setStatus(patch.getStatus());
                workspace.setStatusModifiedBy(getUserURI());
                workspace.setStatusDateModified(now());
                statusUpdated[0] = true;
            }

            if (patch.getName() != null && !patch.getName().equals(workspace.getName())) {
                workspace.setName(patch.getName());
            }

            if (patch.getDescription() != null && !patch.getDescription().equals(workspace.getDescription())) {
                workspace.setDescription(patch.getDescription());
            }

            return dao.write(workspace);
        });

        updated.setCanManage(true);
        updated.setCanCollaborate(true);

        if (statusUpdated[0]) {
            audit("WS_UPDATE", "workspace", updated.getIri(), "status", updated.getStatus());
        }
        return updated;
    }

    public Map<Node, WorkspaceRole> getUsers(Node iri) {
        var result = new HashMap<Node, WorkspaceRole>();
        tx.executeRead(ds -> {
                var m = ds.getDefaultModel();
                var r = m.wrapAsResource(iri);
                validateResource(r, FS.Workspace);
                getResourceProperties(r, FS.member).forEach(u -> result.put(u.asNode(), WorkspaceRole.Member));
                getResourceProperties(r, FS.manage).forEach(u -> result.put(u.asNode(), WorkspaceRole.Manager));
        });
        return result;
    }

    public void setUserRole(Node workspace, Node user, WorkspaceRole role) {
        tx.executeWrite(ds -> {
            var m = ds.getDefaultModel();
            var workspaceResource = m.wrapAsResource(workspace);
            var userResource = m.wrapAsResource(user);
            validateResource(workspaceResource, FS.Workspace);
            validateResource(userResource, FS.User);
            var canManage = workspaceResource.hasProperty(FS.manage, m.wrapAsResource(getUserURI())) || isAdmin();
            if (!canManage) {
                throw new AccessDeniedException();
            }
            m.removeAll(workspaceResource, FS.manage, userResource)
                    .removeAll(workspaceResource, FS.member, userResource);
            switch (role) {
                case Member -> workspaceResource.addProperty(FS.member, userResource);
                case Manager -> workspaceResource.addProperty(FS.manage, userResource);
                case None -> {
                    var writeableCollections = workspaceResource.getModel().listSubjectsWithProperty(FS.ownedBy, workspaceResource)
                            .filterKeep(coll -> coll.hasProperty(FS.manage, userResource) || coll.hasProperty(FS.write, userResource))
                            .toList();
                    writeableCollections.forEach(c -> c.getModel()
                            .removeAll(c, FS.manage, userResource)
                            .removeAll(c, FS.write, userResource)
                            .add(c, FS.read, userResource));
                }
            }
        });
        audit("WS_SET_USER_ROLE", "workspace", workspace, "user", user, "role", role);
    }

    private void validateResource(Resource r, Resource type) {
        validate(r.hasProperty(RDF.type, type), "Invalid resource type");
        validate(!r.hasProperty(FS.dateDeleted), "Resource was deleted");
    }

    public boolean canList(Resource resource) {
        return false;
    }
}
