package io.fairspace.saturn.events;

import io.milton.http.Request;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Value;

@Value
@EqualsAndHashCode(callSuper = true)
public class WebdavEvent extends BaseEvent {
    String httpMethod;
    String path;

    @Builder
    public WebdavEvent(Request.Method httpMethod, String path) {
        super(httpMethod, EventCategory.FILE);
        this.httpMethod = httpMethod.code;
        this.path = path;
    }
}

