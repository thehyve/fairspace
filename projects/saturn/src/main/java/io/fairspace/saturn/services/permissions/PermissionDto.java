package io.fairspace.saturn.services.permissions;

import lombok.Value;
import org.apache.jena.graph.Node;

@Value
public class PermissionDto {
    Node resource;
    Node user;
    Access access;
}
