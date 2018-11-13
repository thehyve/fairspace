package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public abstract class CollectionEvent {
    private User user;
    private Collection collection;
}
