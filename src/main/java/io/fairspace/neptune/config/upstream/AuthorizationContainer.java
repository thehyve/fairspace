package io.fairspace.neptune.config.upstream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

@Component
public class AuthorizationContainer {
    @Autowired
    private HttpServletRequest incomingRequest;

    public String getAuthorizationHeader() {
        return incomingRequest.getHeader("Authorization");
    }
}
