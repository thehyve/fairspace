package io.fairspace.neptune.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class KeycloakUser {
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;

    public String getFullname() {
        return (firstName + " " + lastName).trim();
    }
}
