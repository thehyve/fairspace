package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class CollectionDeletedEvent extends CollectionEvent {
    public CollectionDeletedEvent(User user, Collection collection) {
        super(user, collection);
    }
}
