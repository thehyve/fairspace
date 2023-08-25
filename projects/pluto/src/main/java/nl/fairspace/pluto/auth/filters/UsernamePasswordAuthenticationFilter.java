package nl.fairspace.pluto.auth.filters;

import com.nimbusds.oauth2.sdk.ParseException;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.OAuthFlow;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;
import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;

@Slf4j
public class UsernamePasswordAuthenticationFilter implements GatewayFilter {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BASIC_PREFIX = "Basic ";
    private final OAuthFlow oAuthFlow;

    public UsernamePasswordAuthenticationFilter(OAuthFlow oAuthFlow) {
        this.oAuthFlow = oAuthFlow;
    }

    private OAuthAuthenticationToken retrieveHeaderAuthorization(ServerWebExchange exchange) throws ParseException, IOException, URISyntaxException {
        log.debug("Check authentication header for " + exchange.getRequest().getURI().getPath());

        String authorizationHeader = exchange.getRequest().getHeaders().getFirst(AUTHORIZATION_HEADER);

        if (authorizationHeader == null) {
            log.debug("No Authorization header provided");
            return null;
        }

        if (!authorizationHeader.startsWith(BASIC_PREFIX)) {
            log.debug("Authorization header does not contain a Basic token");
            return null;
        }

        var auth = authorizationHeader.substring(BASIC_PREFIX.length());

        return fetchToken(auth);
    }

    private OAuthAuthenticationToken fetchToken(String auth) throws ParseException, IOException {
        var decoded = new String(Base64.getDecoder().decode(auth), StandardCharsets.UTF_8);
        var usernamePassword = decoded.split(":");
        if (usernamePassword.length != 2) {
            log.debug("Malformed Basic authorization header");
            return null;
        }
        return oAuthFlow.retrieveTokenBasicAuth(usernamePassword[0], usernamePassword[1]);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (exchange.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE) != null) {
            return chain.filter(exchange);
        }

        // Otherwise, check if the authorization can be found in the header
        OAuthAuthenticationToken authenticationToken;
        try {
            authenticationToken = retrieveHeaderAuthorization(exchange);
        } catch (ParseException | URISyntaxException | IOException e) {
            log.error("Error retrieving authentication token", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, e.getMessage());
        }

        log.trace("Retrieved authentication token from request: {}", authenticationToken);

        if (authenticationToken != null) {
            exchange.getAttributes().put(AUTHORIZATION_REQUEST_ATTRIBUTE, authenticationToken);
            Optional<WebSession> session = exchange.getSession().blockOptional(Duration.ofMillis(500));
            if (session.isPresent()) {
                session.get().getAttributes().put(AUTHORIZATION_SESSION_ATTRIBUTE, authenticationToken);
                session.get().save();
            }
        }
       return chain.filter(exchange);
    }
}
