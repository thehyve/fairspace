package io.fairspace.saturn.services.permissions;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.apache.jena.graph.Node;

@Data
@AllArgsConstructor
public class PermissionDto {
    private Node user;
    private Access access;
}
