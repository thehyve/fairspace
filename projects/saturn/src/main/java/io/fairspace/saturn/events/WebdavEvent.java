package io.fairspace.saturn.events;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class WebdavEvent extends BaseEvent {
    String httpMethod;
    String path;

    public String getType() { return httpMethod; }

    @Builder
    public WebdavEvent(String workspace, User user, String httpMethod, String path) {
        super(workspace, user, EventCategory.file);
        this.httpMethod = httpMethod;
        this.path = path;
    }
}

