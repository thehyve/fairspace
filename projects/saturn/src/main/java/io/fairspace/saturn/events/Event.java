package io.fairspace.saturn.events;

public interface Event {
    EventCategory getCategory();

    String getType();
}
