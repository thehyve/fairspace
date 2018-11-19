package io.fairspace.neptune.model.dto;

import io.fairspace.neptune.model.Access;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Permission {
    @NotNull
    String subject;

    @NotNull
    Long collection;

    @NotNull
    Access access;

    public static Permission fromModel(io.fairspace.neptune.model.Permission model) {
        if(model == null)
            return null;

        return new Permission(model.getSubject(), model.getCollection().getId(), model.getAccess());
    }

}
