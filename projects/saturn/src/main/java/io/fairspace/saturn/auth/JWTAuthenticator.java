package io.fairspace.saturn.auth;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;

import static org.apache.http.HttpHeaders.AUTHORIZATION;

@Slf4j
class JWTAuthenticator {
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenValidator tokenValidator;

    JWTAuthenticator(JwtTokenValidator tokenValidator) {
        this.tokenValidator = tokenValidator;
    }

    OAuthAuthenticationToken getUserInfo(HttpServletRequest request) {
        var authorizationHeader = request.getHeader(AUTHORIZATION);

        if (authorizationHeader == null) {
            log.warn("No authorization header was provided for {}", request.getRequestURI());
            return null;
        }

        if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
            log.warn("Invalid authorization header was provided for {}", request.getRequestURI());
            return null;
        }

        var token = authorizationHeader.substring(BEARER_PREFIX.length());
        var claims = tokenValidator.parseAndValidate(token);

        return claims != null ? new OAuthAuthenticationToken(token, claims) : null;
    }
}
