package io.fairspace.saturn.events;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public abstract class BaseEvent<T extends Enum> implements Event {
    final T eventType;
    final EventCategory category;

    @JsonIgnore
    @Override
    public String getType() {
        return eventType.name().toLowerCase();
    }
}
