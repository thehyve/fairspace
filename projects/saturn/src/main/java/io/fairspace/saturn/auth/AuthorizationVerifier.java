package io.fairspace.saturn.auth;

import lombok.NonNull;
import spark.Request;

public interface AuthorizationVerifier {
    /**
     * Verifies the authorization on the given request.
     * Throws a {@link ForbiddenException} if the user does not have proper authorization
     * @param request
     */
    AuthorizationResult verify(@NonNull Request request);
}
