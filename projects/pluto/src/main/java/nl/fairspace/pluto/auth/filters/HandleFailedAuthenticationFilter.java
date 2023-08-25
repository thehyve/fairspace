package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.AuthorizationFailedHandler;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;

/**
 * This filter will check whether any other filter has marked the request as authorized. If not, a handler is called
 * to mark the request as unauthorized
 *
 * To pass this filter, the request should have an attribute called {@link AuthConstants#AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE},
 * set to true
 */
@Slf4j
public class HandleFailedAuthenticationFilter implements GatewayFilter {
    private final AuthorizationFailedHandler failedHandler;

    public HandleFailedAuthenticationFilter(AuthorizationFailedHandler failedHandler) {
        this.failedHandler = failedHandler;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if(!Boolean.TRUE.equals(exchange.getAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE))) {
            var mutatedExchange = failedHandler.handleFailedAuthorization(exchange);
            return mutatedExchange.getResponse().setComplete();
        }

        return chain.filter(exchange);
    }

}
