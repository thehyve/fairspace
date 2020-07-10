package io.fairspace.saturn.services.permissions.dto;

import io.fairspace.saturn.services.permissions.Access;
import org.apache.jena.graph.Node;

public class WorkspacePermissionDto extends PermissionDto implements WorkspaceAccessInfo {
    public WorkspacePermissionDto(Node user, Access access) {
        super(user, access);
    }
}
