package io.fairspace.saturn.services.permissions;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface AccessInfo {
    Access getAccess();

    @JsonProperty("canRead")
    default boolean canRead() {
        return getAccess().compareTo(Access.Read) >= 0;
    }

    @JsonProperty("canWrite")
    default boolean canWrite() {
        return getAccess().compareTo(Access.Write) >= 0;
    }

    @JsonProperty("canManage")
    default boolean canManage() {
        return getAccess().compareTo(Access.Manage) >= 0;
    }
}
