package io.fairspace.neptune.model.events;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class User {
    private String id;
    private String username;
    private String displayName;
}
