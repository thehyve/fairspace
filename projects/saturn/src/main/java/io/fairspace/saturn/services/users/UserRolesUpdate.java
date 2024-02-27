package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserRolesUpdate {
    private String id;

    @JsonProperty("isAdmin")
    private Boolean admin;

    private Boolean canViewPublicMetadata;

    private Boolean canViewPublicData;

    private Boolean canAddSharedMetadata;

    private Boolean canQueryMetadata;
}
