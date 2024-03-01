package nl.fairspace.pluto.auth.filters;

import java.util.Arrays;
import java.util.stream.Stream;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.server.ServerWebExchange;

import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;

/**
 * This filter will mark every request that has a valid JWT token and that has a certain authority (if specified) as authenticated
 * <p>
 * The constructor takes one or more authorities that are considered valid.
 * <p>
 * The token is expected to be set on the request in an attribute called {@link AuthConstants#AUTHORIZATION_REQUEST_ATTRIBUTE}
 * The {@link nl.fairspace.pluto.auth.filters.HeaderAuthenticationFilter} can be used to inject the token into the request
 * <p>
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
        this.validAuthorities = Arrays.stream(authorities)
                .filter(authority -> authority != null && !authority.isBlank())
                .toArray(String[]::new);
    }

    @Override
    protected boolean isAuthorized(ServerWebExchange exchange) {
        // If not specified otherwise, specific authorization is needed,
        // check for that in the authorities list
        OAuthAuthenticationToken authentication = getAuthentication(exchange);
        if (authentication == null) {
            log.trace("No token provided");
            return false;
        }
        if (authentication.getAuthorities() == null) {
            log.trace("No authorities provided");
            return validAuthorities.length == 0;
        }

        boolean hasAuthority = validAuthorities.length == 0
                || Stream.of(validAuthorities)
                        .anyMatch(authority -> authentication.getAuthorities().contains(authority));

        if (!hasAuthority) {
            log.trace(
                    "JWT does not contain a required authority ({}) for request {}",
                    String.join(",", validAuthorities),
                    exchange.getRequest().getURI());
        }

        return hasAuthority;
    }
}
