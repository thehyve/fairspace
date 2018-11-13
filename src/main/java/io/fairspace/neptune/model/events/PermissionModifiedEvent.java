package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.Data;

@Data
public class PermissionModifiedEvent extends PermissionEvent {
    private Access oldAccess;

    public PermissionModifiedEvent(User user, Permission permission, Collection collection, Access oldAccess) {
        super(user, permission, collection);
        this.oldAccess = oldAccess;
    }
}
