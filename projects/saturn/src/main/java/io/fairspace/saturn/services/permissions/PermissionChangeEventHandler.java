package io.fairspace.saturn.services.permissions;

import org.apache.jena.graph.Node;

@FunctionalInterface
public interface PermissionChangeEventHandler {
    void onPermissionChange(Node currentUser, Node resource, Node user, Access access);
}
