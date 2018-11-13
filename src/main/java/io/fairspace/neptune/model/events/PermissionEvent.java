package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public abstract class PermissionEvent {
    private User user;
    private Permission permission;
    private Collection collection;
}
