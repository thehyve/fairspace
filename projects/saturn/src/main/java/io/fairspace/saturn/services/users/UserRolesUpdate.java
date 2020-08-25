package io.fairspace.saturn.services.users;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserRolesUpdate {
    private String id;

    private Boolean admin;

    private Boolean viewPublicMetadata;

    private Boolean viewPublicData;

    private Boolean addSharedMetadata;
}
