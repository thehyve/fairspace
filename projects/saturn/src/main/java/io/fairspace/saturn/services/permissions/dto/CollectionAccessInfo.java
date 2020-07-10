package io.fairspace.saturn.services.permissions.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.fairspace.saturn.services.permissions.Access;

public interface CollectionAccessInfo {
    Access getAccess();

    @JsonProperty
    default boolean canList() {
        return getAccess().canList();
    }

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
