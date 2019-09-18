package io.fairspace.saturn.events;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class User {
    String id;
    String username;
    String name;
}
