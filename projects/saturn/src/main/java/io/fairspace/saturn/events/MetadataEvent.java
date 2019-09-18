package io.fairspace.saturn.events;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class MetadataEvent extends BaseEvent {
    @JsonIgnore
    Type eventType;

    public String getType() { return eventType.toString(); }

    @Builder
    public MetadataEvent(EventCategory category, String workspace, User user, Type eventType) {
        super(workspace, user, category);
        this.eventType = eventType;
    }

    public enum Type {
        created,
        updated,
        deleted,
        softDeleted
    }
}

