package io.fairspace.saturn.services.users;

import lombok.Data;

import static org.apache.commons.lang3.StringUtils.isNotEmpty;

@Data
class KeycloakUser {
    private String id;
    private String firstName;
    private String lastName;
    private String email;

    String getFullName() {
        var sb = new StringBuilder();
        if (isNotEmpty(firstName)) {
            sb.append(firstName);
            if (isNotEmpty(lastName)) {
                sb.append(' ');
            }
        }
        if (isNotEmpty(lastName)) {
            sb.append(lastName);
        }
        return sb.toString();
    }
}
