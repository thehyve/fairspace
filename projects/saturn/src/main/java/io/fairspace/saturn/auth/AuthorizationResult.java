package io.fairspace.saturn.auth;

import lombok.Value;

@Value
public class AuthorizationResult {
    public static final AuthorizationResult AUTHORIZED = new AuthorizationResult(true, "");

    private final boolean authorized;
    private final String message;

    public static AuthorizationResult notAuthorized(String message) {
        return new AuthorizationResult(false, message);
    }
}
