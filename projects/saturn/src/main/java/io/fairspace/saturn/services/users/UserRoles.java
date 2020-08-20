package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.annotation.*;
import lombok.*;

import static com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL;

@Builder
@Getter @Setter
@JsonInclude(NON_NULL)
public class UserRoles {
    private Boolean admin;
    private Boolean viewPublicMetadata;
    private Boolean viewPublicData;
    private Boolean addSharedMetadata;
}
