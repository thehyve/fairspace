package io.fairspace.saturn.auth;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;

import static org.apache.http.HttpHeaders.AUTHORIZATION;

@Slf4j
class JWTAuthenticator {
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenValidator jwtProcessor;

    JWTAuthenticator(JwtTokenValidator jwtProcessor) {
        this.jwtProcessor = jwtProcessor;
    }

    OAuthAuthenticationToken getUserInfo(HttpServletRequest request) {
        var authorizationHeader = request.getHeader(AUTHORIZATION);

        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            return null;
        }

        var token = authorizationHeader.substring(BEARER_PREFIX.length());
        var claims = jwtProcessor.parseAndValidate(token);

        return claims != null ? new OAuthAuthenticationToken(token, claims) : null;
    }
}
