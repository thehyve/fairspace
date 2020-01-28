package io.fairspace.saturn.services.permissions;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;
import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import io.fairspace.saturn.services.users.Role;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;

import java.util.*;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.rdf.ModelUtils.getStringProperty;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.lang.String.format;
import static java.util.stream.Collectors.toMap;
import static org.apache.commons.lang3.ObjectUtils.min;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

@AllArgsConstructor
@Slf4j
public class PermissionsService {
    public static final String PERMISSIONS_GRAPH = generateMetadataIri("permissions").getURI();

    private final DatasetJobSupport dataset;
    private final PermissionChangeEventHandler permissionChangeEventHandler;
    private final UserService userService;


    public void createResource(Node resource) {
        var model = dataset.getNamedModel(PERMISSIONS_GRAPH);
        model.add(model.asRDFNode(resource).asResource(), FS.manage, model.asRDFNode(getThreadContext().getUser().getIri()));

        audit("RESOURCE_CREATED",
                "resource", resource.getURI());
    }

    public void createResources(Collection<Resource> resources) {
        var resourcePermissions = createDefaultModel();
        var user = resourcePermissions.asRDFNode(getThreadContext().getUser().getIri());
        resources.forEach(resource -> resourcePermissions.add(resource, FS.manage, user));
        dataset.getNamedModel(PERMISSIONS_GRAPH).add(resourcePermissions);
    }

    public void setPermission(Node resource, Node user, Access access) {
        var managingUser = getThreadContext().getUser().getIri();

        var success = dataset.calculateWrite(() -> {
            var g = dataset.getNamedModel(PERMISSIONS_GRAPH);
            ensureAccess(resource, Access.Manage);
            validate(!user.equals(managingUser), "A user may not change his own permissions");

            validate(userService.getUser(user) != null, "A user must be known to the system");

            if (!isCollection(resource)) {
                validate(access != Access.Read, "Regular metadata entities can not be marked as read-only");
                var isSpecifyingWriteAccessOnNonRestrictedResource = access == Access.Write && !isWriteRestricted(resource);
                validate(!isSpecifyingWriteAccessOnNonRestrictedResource,
                        "Regular metadata entities must be marked as write-restricted before granting permissions");
            }

            g.removeAll(g.asRDFNode(resource).asResource(), null, g.asRDFNode(user));

            if (access != Access.None) {
                g.add(g.asRDFNode(resource).asResource(), g.createProperty(FS.NS, access.name().toLowerCase()), g.asRDFNode(user));
                return true;
            }
            return false;
        });

        if (success) {
            audit("PERMISSION_UPDATED",
                    "manager", getThreadContext().getUser().getName(),
                    "target-user", user.getURI(),
                    "resource", resource.getURI(),
                    "access", access.toString());
        }

        if (permissionChangeEventHandler != null)
            permissionChangeEventHandler.onPermissionChange(managingUser, resource, user, access);
    }

    public void ensureAccess(Set<Node> nodes, Access requestedAccess) {
        // Organisation admins are allowed to do anything
        if (getThreadContext().getUser().getRoles().contains(Role.Coordinator)) {
            return;
        }

        getPermissions(nodes).forEach((node, access) -> {
            if (access.compareTo(requestedAccess) < 0) {
                throw new MetadataAccessDeniedException(format("User %s has no %s access to some of the requested resources",
                        getThreadContext().getUser().getIri(), requestedAccess.name().toLowerCase()), node);
            }
        });
    }

    Map<Node, Access> getPermissions(Node resource) {
        return dataset.calculateRead(() -> {
            var authority = getAuthority(resource);
            ensureAccess(authority, Access.Read);

            var result = new HashMap<Node, Access>();
            var g = dataset.getNamedModel(PERMISSIONS_GRAPH);
            g.listStatements(g.asRDFNode(authority).asResource(), null, (RDFNode)null)
                    .forEachRemaining(stmt -> {
                        var user = stmt.getObject().asNode();
                        if (stmt.getPredicate().equals(FS.read)) {
                            result.put(user, Access.Read);
                        } else if (stmt.getPredicate().equals(FS.write)) {
                            result.put(user, Access.Write);
                        } else if (stmt.getPredicate().equals(FS.manage)) {
                            result.put(user, Access.Manage);
                        }
                    });
            return result;
        });
    }

    boolean isWriteRestricted(Node resource) {
        return dataset.calculateRead(() ->
                dataset.getNamedModel(PERMISSIONS_GRAPH).createResource(resource.getURI()).hasLiteral(FS.writeRestricted, true));
    }

    void setWriteRestricted(Node resource, boolean restricted) {
        var success = dataset.calculateWrite(() -> {
            ensureAccess(resource, Access.Manage);
            validate(!isCollection(resource), "A collection cannot be marked as write-restricted");
            if (restricted != isWriteRestricted(resource)) {
                var g = dataset.getNamedModel(PERMISSIONS_GRAPH);
                var s = g.asRDFNode(resource).asResource();
                g.removeAll(s, FS.writeRestricted, null);
                if (restricted) {
                    g.add(s, FS.writeRestricted, g.createTypedLiteral(true));
                } else {
                    g.removeAll(s, FS.write, null);
                }
                return true;
            }
            return false;
        });

        if (success) {
                audit("SET_WRITE_RESTRICTED",
                        "resource", resource.getURI());
        }
    }

    private void ensureAccess(Node resource, Access access) {
        // Organisation admins are allowed to do anything
        if (getThreadContext().getUser().getRoles().contains(Role.Coordinator)) {
            return;
        }

        if (getPermission(resource).compareTo(access) < 0) {
            throw new MetadataAccessDeniedException(format("User %s has no %s access to resource %s", getThreadContext().getUser().getIri(), access.name().toLowerCase(), resource), resource);
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
        return dataset.calculateRead(() -> {
            var authorities = getAuthorities(nodes);
            var permissionsForAuthorities = getPermissionsForAuthorities(authorities.keys());
            var result = new HashMap<Node, Access>();
            authorities.forEach((authority, node) -> result.put(node, permissionsForAuthorities.get(authority)));
            return result;
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

        var userObject = getThreadContext().getUser();

        // Organisation admins are allowed to do anything, so they have manage right
        // to any resource
        if (userObject.getRoles().contains(Role.Coordinator)) {
            authorities.forEach(node -> result.put(node, Access.Manage));
            return result;
        }

        Access maxAccess;
        if (userObject.getRoles().contains(Role.CanWrite)) {
            maxAccess = Access.Manage; // sic!
        } else  if (userObject.getRoles().contains(Role.CanRead)) {
            maxAccess = Access.Read;
        } else {
            maxAccess = Access.None;
        }

        var g = dataset.getNamedModel(PERMISSIONS_GRAPH);
        var userResource = g.wrapAsResource(userObject.getIri());
        authorities.forEach(a -> result.put(a, min(maxAccess, getRawResourceAccess(g.wrapAsResource(a), userResource))));

        return result;
    }

    private Access getRawResourceAccess(Resource r, Resource user) {
        if (r.hasProperty(FS.manage, user)) {
            return Access.Manage;
        }
        if (r.hasProperty(FS.write, user)) {
            return  Access.Write;
        }
        if (r.hasProperty(FS.read, user)) {
            return Access.Read;
        }
        if (r.inModel(dataset.getDefaultModel()).hasProperty(RDF.type, FS.Collection)) {
            return Access.None;
        }
        if (r.hasLiteral(FS.writeRestricted, true)) {
            return Access.Read;
        }

        return Access.Write;
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

        collectionPaths.forEach(path -> model.listSubjectsWithProperty(FS.filePath, path)
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
