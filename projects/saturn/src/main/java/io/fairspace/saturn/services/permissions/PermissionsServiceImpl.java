package io.fairspace.saturn.services.permissions;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.vocabulary.RDFS;

import javax.mail.Message;
import javax.mail.internet.InternetAddress;
import java.util.*;
import java.util.stream.Stream;

import static com.google.common.collect.Iterables.partition;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.lang.String.format;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.apache.jena.system.Txn.calculateRead;
import static org.apache.jena.system.Txn.executeRead;

@AllArgsConstructor
@Slf4j
public class PermissionsServiceImpl implements PermissionsService {
    private static final int BATCH_SIZE = 100;
    private static final String PERMISSIONS_GRAPH = generateMetadataIri("permissions").getURI();

    private final RDFConnection rdf;
    private final UserService userService;
    private final MailService mailService;

    @Override
    public void createResource(Node resource) {
        rdf.update(storedQuery("permissions_create_resource", resource, userService.getCurrentUser().getIri()));
    }

    @Override
    public void createResources(Collection<Resource> resources) {
        Model resourcePermissions = createDefaultModel();
        Resource user = ResourceFactory.createResource(userService.getCurrentUser().getIri().getURI());
        resources.forEach(resource -> resourcePermissions.add(resource, FS.manage, user));
        rdf.load(PERMISSIONS_GRAPH, resourcePermissions);
    }

    @Override
    public void setPermission(Node resource, Node user, Access access) {
        var managingUser = userService.getCurrentUser().getIri();

        commit(format("Setting permission for resource %s, user %s to %s", resource, user, access), rdf, () -> {
            ensureAccess(resource, Access.Manage);
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
      return getPermissions(List.of(resource)).get(resource);
    }

    @Override
    public void ensureAccess(Set<Node> nodes, Access requestedAccess) {
        // Check access control in batches as the SPARQL queries do not
        // accept an arbitrary number of parameters
        partition(nodes, BATCH_SIZE)
                .forEach(batch -> ensureAccessWithoutBatch(batch, requestedAccess));
    }

    @Override
    public Map<Node, Access> getPermissions(Node resource) {
        return calculateRead(rdf, () -> {
            var authority = getAuthority(resource);
            ensureAccess(authority, Access.Read);

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
            ensureAccess(resource, Access.Manage);
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

    private void ensureAccess(Node resource, Access access) {
        if (getPermission(resource).compareTo(access) < 0) {
            throw new AccessDeniedException(format("User %s has no %s access to resource %s", userService.getCurrentUser().getIri(), access.name().toLowerCase(), resource));
        }
    }

    /**
     * Retrieves the permissions of the current user for the given authorities
     * @param nodes
     * @return
     */
    public Map<Node, Access> getPermissions(Collection<Node> nodes) {
        var result = new HashMap<Node, Access>();
        executeRead(rdf, () -> partition(nodes, BATCH_SIZE)
                .forEach(batch -> result.putAll(getPermissionsWithoutBatch(batch))));
        return result;
    }

    private Map<Node, Access> getPermissionsWithoutBatch(Collection<Node> nodes) {
            var authorities = getAuthorities(nodes);
            var permissionsForAuthorities = getPermissionsForAuthorities(authorities.keys());
            var result = new HashMap<Node, Access>();
            authorities.forEach((authority, node) -> result.put(node, permissionsForAuthorities.get(authority)));
            return result;
    }

    /**
     * Ensure that the current user has the requested access level for all nodes
     * @param nodes
     * @param requestedAccess
     */
    private void ensureAccessWithoutBatch(Collection<Node> nodes, Access requestedAccess) {
        var authorities = getAuthorities(nodes);
        getPermissionsForAuthorities(authorities.keys()).forEach((authority, access) -> {
            if (access.compareTo(requestedAccess) < 0) {
                throw new MetadataAccessDeniedException(format("User %s has no %s access to some of the requested resources",
                        userService.getCurrentUser().getIri(), requestedAccess.name().toLowerCase()), authorities.get(authority).iterator().next());
            }
        });
    }

    /**
     * Retrieves the permissions of the current user for the given authorities
     * @param authorities
     * @return
     */
    private Map<Node, Access> getPermissionsForAuthorities(Collection<Node> authorities) {
        var result = new HashMap<Node, Access>();
        rdf.querySelect(storedQuery("permissions_get_for_user", authorities, userService.getCurrentUser().getIri()),
                row -> result.put(row.getResource("subject").asNode(), getAccess(row)));
        authorities.forEach(authority -> result.computeIfAbsent(authority, this::defaultAccess));
        return result;
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
        return getFileAuthorities(List.of(resource)).getOrDefault(resource, resource);
    }

    /**
     * Return a list of enclosing collections for the given nodes
     *
     * If any node is given that does not belong to a collection, it will not
     * be included in the resulting set of authorities.
     * @param fileNodes List of file/directory nodes
     * @return
     */
    private Map<Node, Node> getFileAuthorities(Collection<Node> fileNodes) {
        Map<Node, Node> authorities = new HashMap<>();

        rdf.querySelect(
                storedQuery("get_parent_collections", fileNodes),
                row -> authorities.put(row.get("subject").asNode(), row.get("collection").asNode()));

        return authorities;
    }

    /**
     *
     * @param nodes
     * @return A multimap from authority to the related nodes (one authority can control multiple resources)
     *         The authority could be the original nodes for metadata entities, or the enclosing collection
     *         for files or directories
     */
    private Multimap<Node, Node> getAuthorities(Collection<Node> nodes) {
        var result = HashMultimap.<Node, Node>create();

        var fileAuthorities = getFileAuthorities(nodes);
        fileAuthorities.forEach((file, authority) -> result.put(authority, file));
        nodes.forEach(node -> {
            if (!result.containsValue(node)) {
                result.put(node, node);
            }
        });

        return result;
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
