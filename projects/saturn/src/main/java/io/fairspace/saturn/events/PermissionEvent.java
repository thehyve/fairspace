package io.fairspace.saturn.events;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class PermissionEvent extends BaseEvent {
    @JsonIgnore
    Type eventType;

    String resource;
    String otherUser;
    String access;

    public String getType() { return eventType.toString(); }

    @Builder
    public PermissionEvent(String workspace, User user, Type eventType, String resource, String otherUser, String access) {
        super(workspace, user, EventCategory.permission);
        this.eventType = eventType;
        this.resource = resource;
        this.otherUser = otherUser;
        this.access = access;
    }

    public enum Type {
        resourceCreated,
        permissionSet,
        permissionDeleted,
        writeRestrictUpdated
    }
}

