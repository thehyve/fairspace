package io.fairspace.saturn.services.permissions;

import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Resource;

import java.util.Collection;
import java.util.Map;
import java.util.Set;


public interface PermissionsService {
    /**
     * Creates a new resource entity and grants current user Manage access to it.
     * This method should be only called by other high-level APIs and must not be directly exposed as an API endpoint.
     * @param resource
     */
    void createResource(Node resource);

    /**
     * Creates multiple new resource entities and grants current user Manage access to it.
     * This method should be only called by other high-level APIs and must not be directly exposed as an API endpoint.
     * @param resources
     */
    void createResources(Collection<Resource> resources);

    /**
     * Sets permission for a specific user and resource.
     * Current user must have Manage access to the resource.
     * Use Access.None for revoking permissions.
     * @param resource
     * @param user
     * @param access
     */
    void setPermission(Node resource, Node user, Access access);

    /**
     * @param resource
     * @return Current user's permission for the resource. If no permission was set explicitly, returns the default value
     * depending on the type of the resource.
     */
    Access getPermission(Node resource);

    /**
     * Ensures the current user has access to the specified nodes
     * @param nodes
     * @param requestedAccess
     * @throws io.fairspace.saturn.services.AccessDeniedException if the user does not have requested access to all nodes
     */
    void ensureAccess(Set<Node> nodes, Access requestedAccess);

    /**
     *
     * @param resource
     * @return A map containing all non-default permissions from all users for a specific resource
     */
    Map<Node, Access> getPermissions(Node resource);

    /**
     * @param nodes
     * @return Current user's permissions for the given nodes. If no permission was set explicitly, returns the default value
     * depending on the type of the resource.
     */
    Map<Node, Access> getPermissions(Collection<Node> nodes);

    /**
     *
     * @param resource
     * @return true if the resource is write-restricted
     */
    boolean isWriteRestricted(Node resource);

    /**
     * Sets fs:writeRestricted attribute for a specific resource
     * @param resource
     * @param restricted
     */
    void setWriteRestricted(Node resource, boolean restricted);
}
