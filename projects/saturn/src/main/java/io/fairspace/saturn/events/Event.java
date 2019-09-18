package io.fairspace.saturn.events;

public interface Event {
    String getWorkspace();
    void setWorkspace(String workspace);
    User getUser();
    void setUser(User user);

    EventCategory getCategory();
    String getType();
}
