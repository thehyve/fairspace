package io.fairspace.callisto.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PermissionEvent {
    private User user;
    private User subject;
    private Permission permission;
    private Collection collection;
    private boolean permissionForNewCollection;
}
