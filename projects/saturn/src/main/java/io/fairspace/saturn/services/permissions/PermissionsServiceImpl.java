package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDFS;

import javax.mail.Message;
import javax.mail.internet.InternetAddress;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.lang.String.format;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.apache.jena.system.Txn.calculateRead;

@AllArgsConstructor
@Slf4j
public class PermissionsServiceImpl implements PermissionsService {
    private final RDFConnection rdf;
    private final UserService userService;
    private final MailService mailService;

    @Override
    public void createResource(Node resource) {
        rdf.update(storedQuery("permissions_create_resource", resource, userService.getCurrentUser().getIri()));
    }

    @Override
    public void setPermission(Node resource, Node user, Access access) {
        var managingUser = userService.getCurrentUser().getIri();

        commit(format("Setting permission for resource %s, user %s to %s", resource, user, access), rdf, () -> {
            ensureHasAccess(resource, Access.Manage);
            validate(!user.equals(managingUser), "A user may not change his own permissions");
            if (!isCollection(resource)) {
                validate(access != Access.Read, "Regular metadata entities can not be marked as read-only");
                var isSpecifyingWriteAccessOnNonRestrictedResource = access == Access.Write && !isWriteRestricted(resource);
                validate(!isSpecifyingWriteAccessOnNonRestrictedResource,
                        "Regular metadata entities must be marked as write-restricted before granting permissions");
            }

            if (access == Access.None) {
                rdf.update(storedQuery("permissions_delete", resource, user));
            } else {
                rdf.update(storedQuery("permissions_set", resource, user, toNode(access)));
            }
        });

        notifyUser(user, resource, access);
    }

    @Override
    public Access getPermission(Node resource) {
        return calculateRead(rdf, () -> {
            var authority = getAuthority(resource);
            var processor = new QuerySolutionProcessor<>(PermissionsServiceImpl::getAccess);
            rdf.querySelect(storedQuery("permissions_get_for_user", authority, userService.getCurrentUser().getIri()), processor);
            return processor.getSingle().orElseGet(() -> defaultAccess(authority));
        });
    }

    @Override
    public Map<Node, Access> getPermissions(Node resource) {
        return calculateRead(rdf, () -> {
            var authority = getAuthority(resource);
            ensureHasAccess(authority, Access.Read);

            var result = new HashMap<Node, Access>();
            rdf.querySelect(storedQuery("permissions_get_all", authority), row ->
                    result.put(row.getResource("user").asNode(), getAccess(row)));
            return result;
        });
    }

    @Override
    public boolean isWriteRestricted(Node resource) {
        return rdf.queryAsk(storedQuery("permissions_is_restricted", resource));
    }

    @Override
    public void setWriteRestricted(Node resource, boolean restricted) {
        commit(format("Setting fs:writeRestricted attribute of resource %s to %s", resource, restricted), rdf, () -> {
            ensureHasAccess(resource, Access.Manage);
            validate(!isCollection(resource), "A collection cannot be marked as write-restricted");
            if (restricted != isWriteRestricted(resource)) {
                rdf.update(storedQuery("permissions_set_restricted", resource, restricted));
            }
        });
    }

    private static Access getAccess(QuerySolution row) {
        var access = row.getResource("access").getLocalName();
        return Stream.of(Access.values()).filter(e -> e.name().equalsIgnoreCase(access)).findFirst().orElse(Access.None);
    }

    private static Node toNode(Access access) {
        return createURI(FS.NS + access.name().toLowerCase());
    }

    private void ensureHasAccess(Node resource, Access access) {
        if (getPermission(resource).compareTo(access) < 0) {
            throw new AccessDeniedException(format("User %s has no %s access to resource %s", userService.getCurrentUser().getIri(), access.name().toLowerCase(), resource));
        }
    }

    private boolean isCollection(Node resource) {
        return rdf.queryAsk(storedQuery("is_collection", resource));
    }


    private Access defaultAccess(Node resource) {
        return isCollection(resource) ? Access.None : isWriteRestricted(resource) ? Access.Read : Access.Write;
    }

    /**
     * @param resource
     * @return an authoritative resource for the given resource: currently either the parent collection (for files and directories) or the resource itself
     */
    private Node getAuthority(Node resource) {
        var processor = new QuerySolutionProcessor<>(row -> row.getResource("collection").asNode());
        rdf.querySelect(storedQuery("get_parent_collection", resource), processor);
        return processor.getSingle().orElse(resource);
    }

    private void notifyUser(Node user, Node resource, Access access) {
        Optional.ofNullable(userService.getUser(user))
                .map(User::getEmail)
                .ifPresent(email -> {
                    try {
                        var msg = mailService.newMessage();
                        msg.setRecipient(Message.RecipientType.TO, new InternetAddress(email));
                        msg.setSubject("Your access permissions changed");
                        msg.setText("Your access level for " +
                                (isCollection(resource)
                                        ? "collection " + getLabel(resource)
                                        : "resource " + getLabel(resource) + " (" + resource.getURI() + ")") +
                                " was set to " + access + " by " + userService.getCurrentUser().getName() + ".");
                        mailService.send(msg);
                    } catch (Exception e) {
                        log.error("Error sending an email", e);
                    }
                });
    }

    private String getLabel(Node node) {
        var stmts = rdf.queryConstruct(storedQuery("select_by_mask", defaultGraphIRI, node, RDFS.label, null)).listStatements();
        return stmts.hasNext() ? stmts.nextStatement().getString() : "";
    }
}
