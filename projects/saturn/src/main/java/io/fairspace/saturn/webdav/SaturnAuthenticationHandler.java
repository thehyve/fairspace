package io.fairspace.saturn.webdav;

import io.milton.http.AuthenticationHandler;
import io.milton.http.Request;
import io.milton.resource.Resource;

import java.util.List;

import static io.fairspace.saturn.auth.SecurityUtil.userInfo;

/**
 * Relies on top-level authentication performed by JWTAuthenticator
 */
public class SaturnAuthenticationHandler implements AuthenticationHandler {

    @Override
    public boolean supports(Resource r, Request request) {
        return true;
    }

    @Override
    public Object authenticate(Resource resource, Request request) {
        var auth = userInfo();
        return auth != null ? auth : "Anonymous (for local development only)";
    }

    @Override
    public void appendChallenges(Resource resource, Request request, List<String> challenges) {
    }

    @Override
    public boolean isCompatible(Resource resource, Request request) {
        return true;
    }

    @Override
    public boolean credentialsPresent(Request request) {
        return true;
    }
}
