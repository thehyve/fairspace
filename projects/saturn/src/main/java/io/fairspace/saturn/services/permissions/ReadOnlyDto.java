package io.fairspace.saturn.services.permissions;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ReadOnlyDto {
    private boolean readOnly;
}
