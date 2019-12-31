package io.fairspace.saturn.auth;

import io.fairspace.saturn.ThreadContext;

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
        return ofNullable(getThreadContext())
                .map(ThreadContext::getUserInfo)
                .map(info -> "Bearer " + info.getAccessToken())
                .orElse(null);
    }
}
