package io.fairspace.saturn.services.permissions.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.fairspace.saturn.services.permissions.Access;

public interface WorkspaceAccessInfo {
    Access getAccess();

    @JsonProperty(value="isMember")
    default boolean isMember() {
        return getAccess().isMember();
    }

    @JsonProperty
    default boolean canManage() {
        return getAccess().canManage();

    }
}
