package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Collection;
import lombok.Data;

@Data
public class CollectionAddedEvent extends CollectionEvent {
    public CollectionAddedEvent(User user, Collection collection) {
        super(user, collection);
    }
}
