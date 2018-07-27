package io.fairspace.neptune.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequest;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;

class AuthorizedClientHttpRequestFactory extends HttpComponentsClientHttpRequestFactory {
    @Autowired
    private HttpServletRequest incomingRequest;

    @Override
    public ClientHttpRequest createRequest(URI uri, HttpMethod httpMethod) throws IOException {
        ClientHttpRequest request = super.createRequest(uri, httpMethod);
        String authorization = incomingRequest.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization != null) {
            request.getHeaders().add(HttpHeaders.AUTHORIZATION, authorization);
        }
        return request;
    }
}
