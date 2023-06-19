package nl.fairspace.pluto.config;

import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Optional;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

/**
 * Forwards request body regardless of HTTP method
 */
public class WebDAVHostRoutingFilter implements GlobalFilter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        var token = (OAuthAuthenticationToken)exchange.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
        if (token == null) {
            Optional<WebSession> session = exchange.getSession().blockOptional(Duration.ofMillis(500));
            if (session.isPresent()) {
                if (session.get().getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE) != null) {
                    OAuthAuthenticationToken finalToken = session.get().getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
                    if (finalToken != null) {
                        exchange.getRequest().mutate().headers(h -> {
                            h.remove(AUTHORIZATION_HEADER);
                            h.add(AUTHORIZATION_HEADER, BEARER_PREFIX + finalToken.getAccessToken());
                        }).build();
                    }
                }
            }
        } else {
            exchange.getRequest().mutate().headers(h -> {
                h.remove(AUTHORIZATION_HEADER);
                h.add(AUTHORIZATION_HEADER, BEARER_PREFIX + token.getAccessToken());
            }).build();
        }
        return chain.filter(exchange);
    }

}
