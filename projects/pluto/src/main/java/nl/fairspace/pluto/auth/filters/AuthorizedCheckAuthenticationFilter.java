package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.*;
import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.model.*;

import javax.servlet.http.*;
import java.util.stream.*;

/**
 * This filter will mark every request that has a valid JWT token and that has a certain authority as authenticated
 *
 * The constructor takes one or more authorities that are considered valid.
 *
 * The token is expected to be set on the request in an attribute called {@link AuthConstants#AUTHORIZATION_REQUEST_ATTRIBUTE}
 * The {@link nl.fairspace.pluto.auth.filters.HeaderAuthenticationFilter} can be used to inject the token into the request
 *
 * It will add an attribute called {@link AuthConstants#AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE}
 * to the current request, set to true
 *
 * @see nl.fairspace.pluto.auth.filters.HeaderAuthenticationFilter
 * @see CheckAuthenticationFilter
 */
@Slf4j
public class AuthorizedCheckAuthenticationFilter extends CheckAuthenticationFilter {
    String[] validAuthorities;

    public AuthorizedCheckAuthenticationFilter(String... authorities) {
        this.validAuthorities = authorities;
    }

    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        // If not specified otherwise, specific authorization is needed,
        // check for that in the authorities list
        OAuthAuthenticationToken authentication = getAuthentication(request);
        if(authentication == null || authentication.getAuthorities() == null) {
            log.trace("No token provided or no authorities provided");
            return false;
        }

        boolean hasAuthority = Stream.of(validAuthorities)
                .anyMatch(authority -> authentication.getAuthorities().contains(authority));

        if(!hasAuthority) {
            log.trace("JWT does not contain a required authority ({}) for request {}", String.join(",", validAuthorities), request.getRequestURI());
        }

        return hasAuthority;

    }
}
