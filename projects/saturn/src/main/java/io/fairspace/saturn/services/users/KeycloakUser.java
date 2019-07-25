package io.fairspace.saturn.services.users;

import lombok.Data;

import java.util.Objects;
import java.util.stream.Stream;

import static java.util.stream.Collectors.joining;

@Data
class KeycloakUser {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean enabled;

    String getFullName() {
        return Stream.of(firstName, lastName)
                .filter(Objects::nonNull)
                .collect(joining(" "));
    }
}
