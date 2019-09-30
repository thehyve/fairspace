package io.fairspace.saturn.events;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
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

