package nl.fairspace.pluto.app.auth.filters;

import com.sun.org.apache.xpath.internal.operations.Bool;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.AuthorizationFailedHandler;

import javax.servlet.http.HttpServletRequest;

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;

@Slf4j
public class AuthenticatedCheckAuthenticationFilter extends CheckAuthenticationFilter {
    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        boolean hasAuthentication = hasAuthentication(request);

        if(!hasAuthentication) {
            log.warn("No valid JWT has been provided");
        }

        return hasAuthentication;
    }
}
