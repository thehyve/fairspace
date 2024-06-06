package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

@Slf4j
@Component
public class TokenForwarderPreFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        OAuthAuthenticationToken token =
                (OAuthAuthenticationToken) exchange.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
        // If no token was provided, the request is probably not authenticated.
        // In that case, we can not send along any request header
        if (token == null) {
            log.trace("No valid token was found on the request. No token could be forwarded upstream");
            return chain.filter(exchange);
        }
        // Add the token upstream
        ServerWebExchange modifiedExchange = exchange.mutate()
                // Here we'll modify the original request:
                .request(originalRequest -> originalRequest.header("Authorization", "Bearer " + token.getAccessToken()))
                .build();
        log.trace("Added oAuth token to upstream request");

        return chain.filter(modifiedExchange);
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
