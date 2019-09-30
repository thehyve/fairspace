package io.fairspace.saturn.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class CollectionEvent extends BaseEvent {
    Collection collection;

    @Builder
    public CollectionEvent(Type eventType, Collection collection) {
        super(eventType, EventCategory.COLLECTION);
        this.collection = collection;
    }

    public enum Type {
        CREATED,
        UPDATED,
        MOVED,
        DELETED,
        LISTED
    }

    @Value
    @AllArgsConstructor
    public static class Collection {
        String iri;
        String name;
    }
}

