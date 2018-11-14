package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.Data;

@Data
public class PermissionAddedEvent extends PermissionEvent {
    private boolean permissionForNewCollection;

    public PermissionAddedEvent(User user, User subject, Permission permission, Collection collection, boolean permissionForNewCollection) {
        super(user, subject, permission, collection);
        this.permissionForNewCollection = permissionForNewCollection;
    }
}
