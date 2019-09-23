package io.fairspace.saturn.events;

import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class PermissionEvent extends BaseEvent<PermissionEvent.Type> {
    String resource;
    String otherUser;
    String access;

    @Builder
    public PermissionEvent(Type eventType, String resource, String otherUser, String access) {
        super(eventType, EventCategory.PERMISSION);
        this.resource = resource;
        this.otherUser = otherUser;
        this.access = access;
    }

    public enum Type {
        RESOURCE_CREATED,
        UPDATED,
        DELETED,
    }
}

