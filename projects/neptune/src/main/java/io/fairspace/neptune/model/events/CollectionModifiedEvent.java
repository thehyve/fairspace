package io.fairspace.neptune.model.events;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.dto.Permission;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper=true)
public class CollectionModifiedEvent extends CollectionEvent {
    private Collection oldCollection;

    public CollectionModifiedEvent(User user, Collection collection, Collection oldCollection) {
        super(user, collection);
        this.oldCollection = oldCollection;
    }
}
