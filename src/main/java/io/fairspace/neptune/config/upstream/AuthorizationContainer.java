package io.fairspace.neptune.config.upstream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;

@Component
public class AuthorizationContainer {
    @Autowired
    private HttpServletRequest incomingRequest;

    public String getAuthorizationHeader() {
        return incomingRequest.getHeader("Authorization");
    }
}
