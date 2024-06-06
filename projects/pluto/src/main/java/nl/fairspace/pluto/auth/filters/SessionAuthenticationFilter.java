package nl.fairspace.pluto.auth.filters;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

import nl.fairspace.pluto.auth.JwtTokenValidator;
import nl.fairspace.pluto.auth.OAuthFlow;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;
import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;

@Slf4j
public class SessionAuthenticationFilter implements GatewayFilter {
    private JwtTokenValidator jwtTokenValidator;
    private OAuthFlow oAuthFlow;

    public SessionAuthenticationFilter(JwtTokenValidator jwtTokenValidator, OAuthFlow oAuthFlow) {
        this.jwtTokenValidator = jwtTokenValidator;
        this.oAuthFlow = oAuthFlow;
    }

    private OAuthAuthenticationToken retrieveSessionAuthentication(ServerWebExchange exchange, WebSession session) {
        log.trace("Handle authentication for " + exchange.getRequest().getURI().getPath());

        // Get token from session
        OAuthAuthenticationToken token = getTokenFromSession(session);

        // Nothing in session
        if (token == null) {
            log.trace("No JWT has been found in the user session");
            return null;
        }

        log.trace("Retrieved authentication token from session: {}", token);

        // Validate the token. If it validates, a claimsset will be returned
        Map<String, Object> claims = jwtTokenValidator.parseAndValidate(token.getAccessToken());

        // If it validates, return
        if (claims != null) {
            log.trace("Valid JWT found in the user session");
            return token.toBuilder().claimsSet(claims).build();
        }

        // If it does not validate, but we have a valid refresh token, perform a refresh
        log.trace("JWT in user session is not valid anymore.");
        if (token.getRefreshToken() != null) {
            try {
                log.debug(
                        "Access token has expired and a valid refresh token was found in the user session. Try refreshing the access token");

                // Refresh the token
                OAuthAuthenticationToken refreshedToken = oAuthFlow.refreshToken(token);

                log.trace("Refreshed authentication token: {}", refreshedToken);

                if (refreshedToken != null) {
                    // Parse the refreshed token and return the data
                    Map<String, Object> refreshedTokenClaims =
                            jwtTokenValidator.parseAndValidate(refreshedToken.getAccessToken());

                    if (refreshedTokenClaims != null) {
                        log.trace("The access token has been refreshed. Storing the new access token in session.");
                        OAuthAuthenticationToken tokenWithClaims = refreshedToken.toBuilder()
                                .claimsSet(refreshedTokenClaims)
                                .build();
                        storeTokenInSession(tokenWithClaims, session);
                        return tokenWithClaims;
                    } else {
                        log.warn("The access token has been refreshed, but the returned token seems to be invalid.");
                        return null;
                    }
                }

                // If for some reasons the validation failed, the authentication is invalid
                log.trace("Refreshing the access token has failed.");
                return null;
            } catch (Exception e) {
                log.error("An error occurred while refreshing oAuth token", e);
                return null;
            }
        }

        // In this case, both the accesstoken and the refresh token have expired
        log.info(
                "A token was found in session, but both the access_token has expired and no refresh token was available");
        return null;
    }

    private OAuthAuthenticationToken getTokenFromSession(WebSession session) {
        log.trace("Retrieving oAuth token from session with id {}", session.getId());
        Object authenticationToken = session.getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);

        if (authenticationToken instanceof OAuthAuthenticationToken) {
            return (OAuthAuthenticationToken) authenticationToken;
        } else {
            return null;
        }
    }

    private void storeTokenInSession(OAuthAuthenticationToken token, WebSession session) {
        session.getAttributes().put(AUTHORIZATION_SESSION_ATTRIBUTE, token);
        session.save();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // If the authorization is already set, skip this filter
        if (exchange.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE) != null) {
            return chain.filter(exchange);
        }
        Optional<WebSession> session = exchange.getSession().blockOptional(Duration.ofMillis(500));
        if (session.isPresent()) {
            OAuthAuthenticationToken authenticationToken = retrieveSessionAuthentication(exchange, session.get());
            if (authenticationToken != null) {
                exchange.getAttributes().put(AUTHORIZATION_REQUEST_ATTRIBUTE, authenticationToken);
            }
        }
        return chain.filter(exchange);
    }
}
