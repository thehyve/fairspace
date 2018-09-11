package nl.fairspace.pluto.app.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.AuthorizationFailedHandler;

import javax.servlet.http.HttpServletRequest;

@Slf4j
public class AuthenticatedCheckAuthenticationFilter extends CheckAuthenticationFilter {
    public AuthenticatedCheckAuthenticationFilter(AuthorizationFailedHandler failedHandler) {
        super(failedHandler);
    }

    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        boolean hasAuthentication = hasAuthentication(request);

        if(!hasAuthentication) {
            log.warn("No valid JWT has been provided");
        }

        return hasAuthentication;
    }
}
