package io.fairspace.saturn.services.permissions;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ValueDto<T> {
    private T value;
}
