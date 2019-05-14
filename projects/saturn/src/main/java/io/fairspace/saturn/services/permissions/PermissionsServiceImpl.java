package io.fairspace.saturn.services.permissions;

import com.google.common.collect.Iterables;
import io.fairspace.saturn.rdf.SparqlUtils;
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
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

import static io.fairspace.saturn.rdf.SparqlUtils.selectSingle;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.lang.String.format;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
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
    public void createResources(Collection<Resource> resources) {
        Model resourcePermissions = createDefaultModel();
        Resource user = ResourceFactory.createResource(userService.getCurrentUser().getIri().getURI());
        resources.forEach(resource -> resourcePermissions.add(resource, FS.manage, user));
        rdf.load(SparqlUtils.generateMetadataIri("permissions").getURI(), resourcePermissions);
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
            Map<Node, Access> permissions = getPermissions(List.of(authority));
            return permissions.containsKey(authority) ? permissions.get(authority) : defaultAccess(authority);
        });
    }

    @Override
    public void ensureAccess(Set<Node> nodes, Access requestedAccess) {
        // Check access control in batches as the SPARQL queries do not
        // accept an arbitrary number of parameters
        int batchSize = 100;

        Iterables.partition(nodes, batchSize)
                .forEach(batch -> ensureAccessWithoutBatch(batch, requestedAccess));
    }

    /**
     * Ensures that the user has the requested access level to all specified nodes
     * @param nodes
     * @param requestedAccess
     */
    private void ensureAccessWithoutBatch(List<Node> nodes, Access requestedAccess) {
        // Get authorities for the given nodes
        Set<Node> authorities = getAuthorities(nodes);

        // Ensure the user has access to all of the authorities
        ensureHasAccess(authorities, requestedAccess);
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

    /**
     * Retrieves the permissions of the current user for the given authorities
     * @param authorities
     * @return
     */
    private Map<Node, Access> getPermissions(Collection<Node> authorities) {
        return calculateRead(rdf, () -> {
            var result = new HashMap<Node, Access>();
            rdf.querySelect(storedQuery("permissions_get_for_user", authorities, userService.getCurrentUser().getIri()), row ->
                    result.put(row.getResource("subject").asNode(), getAccess(row)));
            return result;
        });
    }

    /**
     * Ensure that the current user has the requested access level for all authorities
     * @param authorities
     * @param requestedAccess
     */
    private void ensureHasAccess(Collection<Node> authorities, Access requestedAccess) {
        Map<Node, Access> permissions = getPermissions(authorities);

        Stream<Access> accessStream = authorities.stream().map(resource -> {
            if (permissions.containsKey(resource)) {
                return permissions.get(resource);
            } else {
                return defaultAccess(resource);
            }
        });

        if ( accessStream.anyMatch(access -> access.compareTo(requestedAccess) < 0)) {
            throw new AccessDeniedException(format("User %s has no %s access to some of the requested resources", userService.getCurrentUser().getIri(), requestedAccess.name().toLowerCase()));
        }
    }

    /**
     * Return a list of file resources within the given set of nodes
     *
     * @param nodes
     * @return List of nodes in the given list that have the type File or Directory
     */
    private List<Node> getFileNodes(List<Node> nodes) {
        return SparqlUtils.select(rdf,
                storedQuery("get_files_and_directories", nodes),
                querySolution -> querySolution.get("subject").asNode());
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
        List<Node> fileAuthorities = getFileAuthorities(List.of(resource));

        return fileAuthorities.size() > 0 ? fileAuthorities.get(0) : resource;
    }

    /**
     * Return a list of enclosing collections for the given nodes
     *
     * If any node is given that does not belong to a collection, it will not
     * be included in the resulting set of authorities.
     * @param fileNodes List of file/directory nodes
     * @return
     */
    private List<Node> getFileAuthorities(List<Node> fileNodes) {
        return SparqlUtils.select(rdf,
                storedQuery("get_parent_collections", fileNodes),
                querySolution -> querySolution.get("collection").asNode());
    }

    /**
     *
     * @param nodes
     * @return The set of authorities relevant for the given nodes.
     *         Could be the original nodes for metadata entities, or the enclosing collection
     *         for files or directories
     */
    private Set<Node> getAuthorities(List<Node> nodes) {
        List<Node> fileNodes = getFileNodes(nodes);
        List<Node> fileAuthorities = getFileAuthorities(fileNodes);

        HashSet<Node> authorities = new HashSet<>(nodes);
        authorities.removeAll(fileNodes);
        authorities.addAll(fileAuthorities);

        return authorities;
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
