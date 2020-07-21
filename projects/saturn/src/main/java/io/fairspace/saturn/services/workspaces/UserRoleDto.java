package io.fairspace.saturn.services.workspaces;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.jena.graph.Node;

@Data
@NoArgsConstructor
public class UserRoleDto {
    @JsonProperty(required = true)
    private Node workspace;
    @JsonProperty(required = true)
    private Node user;
    @JsonProperty(required = true)
    private WorkspaceRole role;
}
