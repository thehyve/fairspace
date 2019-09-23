package io.fairspace.saturn.events;

import lombok.AllArgsConstructor;
import lombok.Value;

@Value
@AllArgsConstructor
public class EventContainer {
    String workspace;
    User user;
    Event event;
}
