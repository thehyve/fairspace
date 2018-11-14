package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class PermissionModifiedEvent extends PermissionEvent {
    private Access oldAccess;

    public PermissionModifiedEvent(User user, User subject, Permission permission, Collection collection, Access oldAccess) {
        super(user, subject, permission, collection);
        this.oldAccess = oldAccess;
    }
}
