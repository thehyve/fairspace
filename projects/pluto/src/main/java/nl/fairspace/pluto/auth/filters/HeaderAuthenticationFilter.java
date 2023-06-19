package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.JwtTokenValidator;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Map;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

/**
 * This filter extracts the token from a provided HTTP Authorization header.
 *
 * If a token is found, it is parsed and validated. If the token is valid (according to the
 * given validator), the extracted token is stored on the request in an attribute called
 * {@link AuthConstants#AUTHORIZATION_REQUEST_ATTRIBUTE}
 */
@Slf4j
public class HeaderAuthenticationFilter implements GatewayFilter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    private final JwtTokenValidator jwtTokenValidator;

    public HeaderAuthenticationFilter(JwtTokenValidator jwtTokenValidator) {
        this.jwtTokenValidator = jwtTokenValidator;
    }

    private OAuthAuthenticationToken retrieveHeaderAuthorization(ServerWebExchange exchange) {
        log.debug("Check authentication header for " + exchange.getRequest().getURI().getPath());

        String authorizationHeader = exchange.getRequest().getHeaders().getFirst(AUTHORIZATION_HEADER);

        if(authorizationHeader == null) {
            log.trace("No Authorization header provided");
            return null;
        }

        if(!authorizationHeader.startsWith(BEARER_PREFIX)) {
            log.info("Authorization header does not contain a Bearer token");
            return null;
        }

        String token = authorizationHeader.substring(BEARER_PREFIX.length());

        // Validate the token. If it validates, a claimsset will be returned
        Map<String, Object> claims = jwtTokenValidator.parseAndValidate(token);

        if(claims != null) {
            log.trace("Valid JWT provided in Authorization header.");
            return new OAuthAuthenticationToken(token, claims);
        } else {
            log.debug("JWT provided in Authorization header is not valid. It may have expired.");
            return null;
        }
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // If the authorization is already set, skip this filter
        if(exchange.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE) != null) {
            return chain.filter(exchange);
        }

        // Otherwise, check if the authorization can be found in the header
        OAuthAuthenticationToken authenticationToken = retrieveHeaderAuthorization(exchange);

        log.trace("Retrieved authentication token from request: {}", authenticationToken);

        if(authenticationToken != null) {
            exchange.getAttributes().put(AUTHORIZATION_REQUEST_ATTRIBUTE, authenticationToken);
        }

        return chain.filter(exchange);
    }

}
