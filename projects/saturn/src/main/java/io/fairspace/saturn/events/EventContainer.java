package io.fairspace.saturn.events;

import io.fairspace.saturn.services.users.User;
import lombok.AllArgsConstructor;
import lombok.Value;

@Value
@AllArgsConstructor
public class EventContainer {
    String workspace;
    User user;
    Event event;
}
