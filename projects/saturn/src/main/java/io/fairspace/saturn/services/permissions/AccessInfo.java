package io.fairspace.saturn.services.permissions;

import com.fasterxml.jackson.annotation.JsonProperty;

public interface AccessInfo {
    Access getAccess();

    @JsonProperty
    default boolean canRead() {
        return getAccess().canRead();
    }

    @JsonProperty
    default boolean canWrite() {
        return getAccess().canWrite();
    }

    @JsonProperty
    default boolean canManage() {
        return getAccess().canManage();
    }
}
