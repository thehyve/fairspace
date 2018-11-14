package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Collection;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class CollectionAddedEvent extends CollectionEvent {
    public CollectionAddedEvent(User user, Collection collection) {
        super(user, collection);
    }
}
