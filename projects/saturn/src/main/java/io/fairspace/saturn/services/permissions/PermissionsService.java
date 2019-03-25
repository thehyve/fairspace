package io.fairspace.saturn.services.permissions;

import org.apache.jena.graph.Node;

import java.util.Map;


public interface PermissionsService {
    /**
     * Creates a new resource entity and grants current user Manage access to it.
     * This method should be only called by other high-level APIs and must not be directly exposed as an API endpoint.
     * @param resource
     */
    void createResource(Node resource);

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
     *
     * @param resource
     * @return A map containing all non-default permissions from all users for a specific resource
     */
    Map<Node, Access> getPermissions(Node resource);

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
