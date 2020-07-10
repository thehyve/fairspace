package io.fairspace.saturn.services.permissions.dto;

import io.fairspace.saturn.services.permissions.Access;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollectionAccessDto implements CollectionAccessInfo {
    private Access access;
}
