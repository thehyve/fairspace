package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.AuthConstants;
import org.springframework.web.server.ServerWebExchange;

/**
 * This filter will mark every request as authorized.
 *
 * It will add an attribute called {@link AuthConstants#AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE}
 * to the current request, set to true
 *
 * @see CheckAuthenticationFilter
 */
@Slf4j
public class AnonymousCheckAuthenticationFilter extends CheckAuthenticationFilter {
    @Override
    protected boolean isAuthorized(ServerWebExchange exchange) {
        return true;
    }
}
