package io.fairspace.saturn.events;

import io.fairspace.saturn.services.collections.Collection;
import lombok.*;

@Value
@EqualsAndHashCode(callSuper = true)
public class CollectionEvent extends BaseEvent {
    Type eventType;
    Collection collection;

    public String getType() { return eventType.toString(); }

    @Builder
    public CollectionEvent(String workspace, User user, Type eventType, Collection collection) {
        super(workspace, user, EventCategory.collection);
        this.eventType = eventType;
        this.collection = collection;
    }

    public enum Type {
        created,
        updated,
        moved,
        deleted,
        listed
    }

    @Value
    @AllArgsConstructor
    public static class Collection {
        final String iri;
        final String name;
    }
}

