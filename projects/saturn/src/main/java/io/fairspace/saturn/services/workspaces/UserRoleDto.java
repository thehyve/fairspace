package io.fairspace.saturn.services.workspaces;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.jena.graph.Node;

@Data
@NoArgsConstructor
public class UserRoleDto {
    private Node workspace;
    private Node user;
    private WorkspaceRole role;
}
