package io.fairspace.saturn.services.permissions.dto;

import io.fairspace.saturn.services.permissions.Access;
import org.apache.jena.graph.Node;

public class CollectionPermissionDto extends PermissionDto implements CollectionAccessInfo {
    public CollectionPermissionDto(Node user, Access access) {
        super(user, access);
    }
}
