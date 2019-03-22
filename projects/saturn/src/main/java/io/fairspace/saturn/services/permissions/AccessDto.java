package io.fairspace.saturn.services.permissions;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccessDto implements AccessInfo {
    private Access access;
}
