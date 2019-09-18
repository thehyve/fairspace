package io.fairspace.saturn.events;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public abstract class BaseEvent implements Event {
    String workspace;
    User user;
    final EventCategory category;
}
