package io.fairspace.saturn.services.permissions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.jena.graph.Node;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PermissionDto implements AccessInfo {
    private Node user;
    private Access access;
}
