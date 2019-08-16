package io.fairspace.saturn.auth;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;

import javax.servlet.http.HttpServletRequest;
import java.util.function.Function;

import static io.fairspace.saturn.Context.currentRequest;
import static org.apache.http.HttpHeaders.AUTHORIZATION;

public class SecurityUtil {
    public static Function<HttpServletRequest, OAuthAuthenticationToken> createAuthenticator(String jwksUrl, String algorithm) {
        return new JWTAuthenticator(JwtTokenValidator.create(jwksUrl, algorithm))::getUserInfo;
    }

    public static Function<HttpServletRequest, OAuthAuthenticationToken> createAuthenticator(JwtTokenValidator validator) {
        return new JWTAuthenticator(validator)::getUserInfo;
    }

    public static String authorizationHeader() {
        return currentRequest()
                .map(context -> context.getHeader(AUTHORIZATION))
                .orElse(null);
    }
}
