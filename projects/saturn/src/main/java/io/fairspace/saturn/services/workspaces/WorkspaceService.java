package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.google.common.base.Strings.isNullOrEmpty;
import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.util.stream.Collectors.toList;

@Slf4j
public class WorkspaceService {
    private final Transactions tx;
    private final UserService userService;
    private final MailService mailService;

    public WorkspaceService(Transactions tx, UserService userService, MailService mailService) {
        this.tx = tx;
        this.userService = userService;
        this.mailService = mailService;
    }

    public List<Workspace> listWorkspaces() {
        return tx.calculateRead(m -> {
            var user = m.wrapAsResource(getUserURI());
            return new DAO(m).list(Workspace.class)
                    .stream()
                    .peek(ws -> {
                        var res = m.wrapAsResource(ws.getIri());
                        ws.setCanManage(userService.currentUser().isAdmin() || user.hasProperty(FS.isManagerOf, res));
                        ws.setCanCollaborate(ws.isCanManage() || user.hasProperty(FS.isMemberOf, res));
                        var collectionCount = m
                                .listSubjectsWithProperty(RDF.type, FS.Collection)
                                .filterKeep(collection -> collection.hasProperty(FS.ownedBy, res))
                                .toList().size();
                        var memberCount = m
                                .listSubjectsWithProperty(RDF.type, FS.User)
                                .filterKeep(u -> u.hasProperty(FS.isMemberOf, res))
                                .toList().size();
                        var managers = new DAO(m).list(User.class).stream()
                                .filter(u -> m.wrapAsResource(u.getIri()).hasProperty(FS.isManagerOf, res))
                                .collect(toList());
                        ws.setSummary(WorkspaceSummary.builder()
                                .collectionCount(collectionCount)
                                .memberCount(memberCount + managers.size())
                                .build());
                        ws.setManagers(managers);
                    }).collect(toList());
        });
    }

    public Workspace getWorkspace(Node iri) {
        return tx.calculateRead(model -> {
            var ws = new DAO(model).read(Workspace.class, iri);
            if (ws == null) {
                return null;
            }
            var res = model.wrapAsResource(ws.getIri());
            var user = model.wrapAsResource(getUserURI());
            ws.setCanManage(userService.currentUser().isAdmin() || user.hasProperty(FS.isManagerOf, res));
            ws.setCanCollaborate(ws.isCanManage() || user.hasProperty(FS.isMemberOf, res));
            return ws;
        });
    }

    private Optional<Workspace> findExistingWorkspace(Model model, String name) {
        return new DAO(model).list(Workspace.class)
                .stream()
                .filter(ws -> {
                    var res = model.wrapAsResource(ws.getIri());
                    return res.hasLiteral(model.createProperty(RDFS.uri, "label"), name);
                })
                .findAny();
    }

    public Workspace createWorkspace(Workspace ws) {
        if (!userService.currentUser().isAdmin()) {
            throw new AccessDeniedException();
        }
        validate(ws.getIri() == null, "IRI must be empty");
        validate(!isNullOrEmpty(ws.getName()), "Please specify workspace name");
        if (ws.getDescription() == null) {
            ws.setDescription("");
        }

        var created = tx.calculateWrite(m -> {
            var conflictingWorkspace = findExistingWorkspace(m, ws.getName());
            if (conflictingWorkspace.isPresent()) {
                throw new IllegalArgumentException("Workspace already exists with the same name.");
            }

            var workspace = new DAO(m).write(ws);

            m.wrapAsResource(getUserURI()).addProperty(FS.isManagerOf, m.wrapAsResource(workspace.getIri()));
            workspace.setCanManage(true);
            workspace.setCanCollaborate(true);
            return workspace;
        });

        audit("WS_CREATE", "workspace", created.getIri());
        return created;
    }

    public Workspace updateWorkspace(Workspace patch) {
        validate(patch.getIri() != null, "No IRI provided");

        var updated = tx.calculateWrite(m -> {
            var dao = new DAO(m);
            var workspace = dao.read(Workspace.class, patch.getIri());
            if (workspace == null) {
                throw new AccessDeniedException();
            }

            var workspaceResource = m.wrapAsResource(patch.getIri());
            var canManage = m.wrapAsResource(getUserURI()).hasProperty(FS.canManage, workspaceResource) || userService.currentUser().isAdmin();
            if (!canManage) {
                throw new AccessDeniedException();
            }

            if (patch.getName() != null && !patch.getName().equals(workspace.getName())) {
                var conflictingWorkspace = findExistingWorkspace(m, patch.getName());
                if (conflictingWorkspace.isPresent()) {
                    throw new IllegalArgumentException("Workspace already exists with the same name.");
                }
                workspace.setName(patch.getName());
            }

            if (patch.getComment() != null && !patch.getComment().equals(workspace.getComment())) {
                workspace.setComment(patch.getComment());
            }

            if (patch.getDescription() != null && !patch.getDescription().equals(workspace.getDescription())) {
                workspace.setDescription(patch.getDescription());
            }

            return dao.write(workspace);
        });

        updated.setCanManage(true);
        updated.setCanCollaborate(true);

        return updated;
    }

    public void deleteWorkspace(Node iri) {
        if (!userService.currentUser().isAdmin()) {
            throw new AccessDeniedException();
        }
        validate(iri != null, "No IRI provided");
        tx.executeWrite(m -> {
            var r = m.wrapAsResource(iri);
            validateResource(r, FS.Workspace);
            validate(!m.contains(null, FS.ownedBy, r), "Workspace is not empty");

            m.removeAll(r, null, null).removeAll(null, null, r);
        });
        audit("WS_DELETE", "workspace", iri);
    }

    public Map<Node, WorkspaceRole> getUsers(Node iri) {
        var result = new HashMap<Node, WorkspaceRole>();
        tx.executeRead(m -> {
            var r = m.wrapAsResource(iri);
            validateResource(r, FS.Workspace);
            m.listResourcesWithProperty(FS.isMemberOf, r)
                    .filterDrop(user -> user.hasProperty(FS.dateDeleted))
                    .forEachRemaining(user -> result.put(user.asNode(), WorkspaceRole.Member));
            m.listResourcesWithProperty(FS.isManagerOf, r)
                    .filterDrop(user -> user.hasProperty(FS.dateDeleted))
                    .forEachRemaining(user -> result.put(user.asNode(), WorkspaceRole.Manager));
        });
        return result;
    }

    public void setUserRole(Node workspace, Node user, WorkspaceRole role) {
        validate(workspace != null, "Workspace is not provided");
        validate(user != null, "User is not provided");
        validate(role != null, "Role is not provided");

        Runnable postCommitAction = tx.calculateWrite(m -> {
            var workspaceResource = m.wrapAsResource(workspace);
            var userResource = m.wrapAsResource(user);
            validateResource(workspaceResource, FS.Workspace);
            validateResource(userResource, FS.User);
            var canManage = m.wrapAsResource(getUserURI()).hasProperty(FS.canManage, workspaceResource) || userService.currentUser().isAdmin();
            if (!canManage) {
                throw new AccessDeniedException();
            }
            m.removeAll(userResource, FS.isManagerOf, workspaceResource)
                    .removeAll(userResource, FS.isMemberOf, workspaceResource);
            String message;
            switch (role) {
                case Member -> {
                    userResource.addProperty(FS.isMemberOf, workspaceResource);
                    message = "You're now a member of workspace " + workspaceResource.getProperty(RDFS.label).getString() + "\n" + workspaceResource.getURI();
                }
                case Manager -> {
                    userResource.addProperty(FS.isManagerOf, workspaceResource);
                    message = "You're now a manager of workspace " + workspaceResource.getProperty(RDFS.label).getString() + "\n" + workspaceResource.getURI();
                }
                default -> {
                    var writeableCollections = workspaceResource.getModel().listSubjectsWithProperty(FS.ownedBy, workspaceResource)
                            .filterKeep(coll -> userResource.hasProperty(FS.canManage, coll) || userResource.hasProperty(FS.canWrite, coll))
                            .toList();
                    writeableCollections.forEach(c -> c.getModel()
                            .removeAll(userResource, FS.canManage, c)
                            .removeAll(userResource, FS.canWrite, c)
                            .add(userResource, FS.canRead, c));
                    message = "You're no longer a member of workspace " + workspaceResource.getProperty(RDFS.label).getString();
                }
            }
            var email = getStringProperty(userResource, FS.email);
            return () -> mailService.send(email, "Access changed", message);
        });

        postCommitAction.run();

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
