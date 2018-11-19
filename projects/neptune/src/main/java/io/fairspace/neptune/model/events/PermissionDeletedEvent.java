package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class PermissionDeletedEvent extends PermissionEvent {
    public PermissionDeletedEvent(User user, User subject, Permission permission, Collection collection) {
        super(user, subject, permission, collection);
    }
}
