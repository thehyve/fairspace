package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.AuthConstants;
import org.springframework.web.server.ServerWebExchange;

/**
 * This filter will mark every request that has a valid JWT token as authenticated
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
public class AuthenticatedCheckAuthenticationFilter extends CheckAuthenticationFilter {
    @Override
    protected boolean isAuthorized(ServerWebExchange exchange) {
        boolean hasAuthentication = hasAuthentication(exchange);

        if(!hasAuthentication) {
            log.debug("No valid JWT has been provided for request {}", exchange.getRequest().getURI());
        }

        return hasAuthentication;
    }
}