package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;
import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

/**
 * Base filter class that will mark a request as authorized if a certain condition holds. The condition
 * is to be implemented by subclasses in the {@link CheckAuthenticationFilter#isAuthorized(ServerWebExchange)} method
 *
 * It will add an attribute called {@link AuthConstants#AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE}
 * to the current request, set to true
 */
@Slf4j
public abstract class CheckAuthenticationFilter implements GatewayFilter {

    protected abstract boolean isAuthorized(ServerWebExchange exchange);

    protected boolean hasAuthentication(ServerWebExchange exchange) {
        return getAuthentication(exchange) != null;
    }

    protected OAuthAuthenticationToken getAuthentication(ServerWebExchange exchange) {
        Object attribute = exchange.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);

        if (attribute instanceof OAuthAuthenticationToken) {
            return (OAuthAuthenticationToken) attribute;
        } else {
            return null;
        }
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (Boolean.TRUE.equals(exchange.getAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE))) {
            return chain.filter(exchange);
        }

        if (isAuthorized(exchange)) {
            // Save authorization check result
            exchange.getAttributes().put(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE, Boolean.TRUE);
        }
        return chain.filter(exchange.mutate().build());
    }
}
