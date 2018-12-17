package io.fairspace.oidc_auth.filters;

import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;

@Slf4j
public class AuthenticatedCheckAuthenticationFilter extends CheckAuthenticationFilter {
    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        boolean hasAuthentication = hasAuthentication(request);

        if(!hasAuthentication) {
            log.debug("No valid JWT has been provided for request {}", request.getRequestURI());
        }

        return hasAuthentication;
    }
}
