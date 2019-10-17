package io.fairspace.saturn.auth;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;

import javax.servlet.http.HttpServletRequest;
import java.util.function.Function;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static java.util.Optional.ofNullable;

public class SecurityUtil {
    public static Function<HttpServletRequest, OAuthAuthenticationToken> createAuthenticator(String jwksUrl, String algorithm) {
        return new JWTAuthenticator(JwtTokenValidator.create(jwksUrl, algorithm))::getUserInfo;
    }

    public static Function<HttpServletRequest, OAuthAuthenticationToken> createAuthenticator(JwtTokenValidator validator) {
        return new JWTAuthenticator(validator)::getUserInfo;
    }

    public static String authorizationHeader() {
        return ofNullable(getThreadContext().getUserInfo())
                .map(OAuthAuthenticationToken::getAccessToken)
                .map(token -> "Bearer " + token)
                .orElse(null);
    }
}
