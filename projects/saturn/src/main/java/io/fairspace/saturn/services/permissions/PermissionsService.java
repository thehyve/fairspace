package io.fairspace.saturn.services.permissions;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import io.fairspace.saturn.events.EventService;
import io.fairspace.saturn.events.PermissionEvent;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDF;

import java.util.*;
import java.util.function.BooleanSupplier;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static com.google.common.collect.Iterables.partition;
import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static io.fairspace.saturn.rdf.SparqlUtils.*;
import static io.fairspace.saturn.rdf.transactions.Transactions.*;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.lang.String.format;
import static java.util.stream.Collectors.toMap;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@AllArgsConstructor
@Slf4j
public class PermissionsService {
    private static final int BATCH_SIZE = 100;
    private static final String PERMISSIONS_GRAPH = generateMetadataIri("permissions").getURI();

    private final Dataset dataset;
    private final Supplier<Node> userIriSupplier;
    private final BooleanSupplier hasFullAccessSupplier;
    private final PermissionChangeEventHandler permissionChangeEventHandler;
    private final EventService eventService;

    public void createResource(Node resource) {
        var model = dataset.getNamedModel(PERMISSIONS_GRAPH);
        model.add(model.asRDFNode(resource).asResource(), FS.manage, model.asRDFNode(userIriSupplier.get()));

        eventService.emitEvent(PermissionEvent.builder()
                .eventType(PermissionEvent.Type.RESOURCE_CREATED)
                .resource(resource.getURI())
                .build()
        );
    }

    public void createResources(Collection<Resource> resources) {
        Model resourcePermissions = createDefaultModel();
        Resource user = ResourceFactory.createResource(userIriSupplier.get().getURI());
        resources.forEach(resource -> resourcePermissions.add(resource, FS.manage, user));
        dataset.getNamedModel(PERMISSIONS_GRAPH).add(resourcePermissions);
    }

    public void setPermission(Node resource, Node user, Access access) {
        var managingUser = userIriSupplier.get();

        executeWrite(format("Setting permission for resource %s, user %s to %s", resource, user, access), dataset, () -> {
            ensureAccess(resource, Access.Manage);
            validate(!user.equals(managingUser), "A user may not change his own permissions");
            if (!isCollection(resource)) {
                validate(access != Access.Read, "Regular metadata entities can not be marked as read-only");
                var isSpecifyingWriteAccessOnNonRestrictedResource = access == Access.Write && !isWriteRestricted(resource);
                validate(!isSpecifyingWriteAccessOnNonRestrictedResource,
                        "Regular metadata entities must be marked as write-restricted before granting permissions");
            }

            PermissionEvent.Type eventType;
            if (access == Access.None) {
                update(dataset, storedQuery("permissions_delete", resource, user));
                eventType = PermissionEvent.Type.DELETED;
            } else {
                update(dataset, storedQuery("permissions_set", resource, user, toNode(access)));
                eventType = PermissionEvent.Type.UPDATED;
            }

            eventService.emitEvent(PermissionEvent.builder()
                    .eventType(eventType)
                    .resource(resource.getURI())
                    .otherUser(user.getURI())
                    .access(access.toString())
                    .build()
            );

        });

        if (permissionChangeEventHandler != null)
            permissionChangeEventHandler.onPermissionChange(userIriSupplier.get(), resource, user, access);
    }

    public void ensureAccess(Set<Node> nodes, Access requestedAccess) {
        // Organisation admins are allowed to do anything
        if (hasFullAccessSupplier.getAsBoolean()) {
            return;
        }

        // Check access control in batches as the SPARQL queries do not
        // accept an arbitrary number of parameters
        partition(nodes, BATCH_SIZE)
                .forEach(batch -> ensureAccessWithoutBatch(batch, requestedAccess));
    }

    Map<Node, Access> getPermissions(Node resource) {
        return calculateRead(dataset, () -> {
            var authority = getAuthority(resource);
            ensureAccess(authority, Access.Read);

            var result = new HashMap<Node, Access>();
            querySelect(dataset, storedQuery("permissions_get_all", authority), row ->
                    result.put(row.getResource("user").asNode(), getAccess(row)));
            return result;
        });
    }

    boolean isWriteRestricted(Node resource) {
        return calculateRead(dataset, () ->
                dataset.getNamedModel(PERMISSIONS_GRAPH).createResource(resource.getURI()).hasLiteral(FS.writeRestricted, true));
    }

    void setWriteRestricted(Node resource, boolean restricted) {
        executeWrite(format("Setting fs:writeRestricted attribute of resource %s to %s", resource, restricted), dataset, () -> {
            ensureAccess(resource, Access.Manage);
            validate(!isCollection(resource), "A collection cannot be marked as write-restricted");
            if (restricted != isWriteRestricted(resource)) {
                update(dataset, storedQuery("permissions_set_restricted", resource, restricted));

                eventService.emitEvent(PermissionEvent.builder()
                        .eventType(PermissionEvent.Type.UPDATED)
                        .resource(resource.getURI())
                        .access(restricted ? "writeRestricted" : "writeNotRestricted")
                        .build()
                );
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
        // Organisation admins are allowed to do anything
        if (hasFullAccessSupplier.getAsBoolean()) {
            return;
        }

        if (getPermission(resource).compareTo(access) < 0) {
            throw new MetadataAccessDeniedException(format("User %s has no %s access to resource %s", userIriSupplier.get(), access.name().toLowerCase(), resource), resource);
        }
    }

    public Access getPermission(Node resource) {
        return getPermissions(List.of(resource)).get(resource);
    }

    /**
     * Retrieves the permissions of the current user for the given resources
     *
     * @param nodes
     * @return
     */
    public Map<Node, Access> getPermissions(Collection<Node> nodes) {
        var result = new HashMap<Node, Access>();
        executeRead(dataset, () -> partition(nodes, BATCH_SIZE)
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
     *
     * @param nodes
     * @param requestedAccess
     */
    private void ensureAccessWithoutBatch(Collection<Node> nodes, Access requestedAccess) {
        var authorities = getAuthorities(nodes);
        getPermissionsForAuthorities(authorities.keySet()).forEach((authority, access) -> {
            if (access.compareTo(requestedAccess) < 0) {
                throw new MetadataAccessDeniedException(format("User %s has no %s access to some of the requested resources",
                        userIriSupplier.get(), requestedAccess.name().toLowerCase()), authorities.get(authority).iterator().next());
            }
        });
    }

    /**
     * Retrieves the permissions of the current user for the given authorities
     *
     * @param authorities
     * @return
     */
    private Map<Node, Access> getPermissionsForAuthorities(Collection<Node> authorities) {
        var result = new HashMap<Node, Access>();

        // Organisation admins are allowed to do anything, so they have manage right
        // to any resource
        if (hasFullAccessSupplier.getAsBoolean()) {
            authorities.forEach(node -> result.put(node, Access.Manage));
            return result;
        }

        querySelect(dataset, storedQuery("permissions_get_for_user", authorities, userIriSupplier.get()),
                row -> result.put(row.getResource("subject").asNode(), getAccess(row)));
        return result;
    }

    private boolean isCollection(Node resource) {
        return dataset.getDefaultModel().createResource(resource.getURI()).hasProperty(RDF.type, FS.Collection);
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
     * <p>
     * If any node is given that does not belong to a collection, it will not
     * be included in the resulting set of authorities.
     *
     * @param fileNodes List of file/directory nodes
     * @return
     */
    private Map<Node, Node> getFileAuthorities(Collection<Node> fileNodes) {
        var fileToCollectionPath = new HashMap<Node, String>(fileNodes.size());
        var collectionPaths = new HashSet<String>();

        var model = dataset.getDefaultModel();
        fileNodes.forEach(node -> {
            var resource = model.createResource(node.getURI());
            if (resource.hasProperty(RDF.type, FS.File) || resource.hasProperty(RDF.type, FS.Directory)) {
                var filePath = getStringProperty(resource, FS.filePath);
                if (filePath != null) {
                    var path = collectionPath(filePath);
                    fileToCollectionPath.put(node, path);
                    collectionPaths.add(path);
                }
            }
        });

        var collectionsByPath = new HashMap<String, Node>();

        collectionPaths.forEach(path -> dataset.getDefaultModel().listSubjectsWithProperty(FS.filePath, path)
                .filterKeep(r -> r.hasProperty(RDF.type, FS.Collection))
                .filterDrop(r -> r.hasProperty(FS.dateDeleted))
                .forEachRemaining(r -> collectionsByPath.put(path, r.asNode())));

        return fileToCollectionPath
                .entrySet()
                .stream()
                .collect(toMap(Map.Entry::getKey, e -> collectionsByPath.get(e.getValue())));
    }

    private static String collectionPath(String filePath) {
        var pos = filePath.indexOf('/');
        return pos < 0 ? filePath : filePath.substring(0, pos);
    }

    /**
     * @param nodes
     * @return A multimap from authority to the related nodes (one authority can control multiple resources)
     * The authority could be the original nodes for metadata entities, or the enclosing collection
     * for files or directories
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
}
