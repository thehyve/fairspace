package io.fairspace.saturn.events;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class MetadataEvent extends BaseEvent<MetadataEvent.Type> {
    @Builder
    public MetadataEvent(Type eventType, EventCategory category) {
        super(eventType, category);
    }

    public enum Type {
        CREATED,
        UPDATED,
        DELETED,
        SOFT_DELETED
    }
}

