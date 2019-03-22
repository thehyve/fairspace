package io.fairspace.saturn.auth;

import lombok.NonNull;
import spark.Request;

public interface AuthorizationVerifier {
    /**
     * Verifies the authorization on the given request.
     * @param request
     * @return
     */
    AuthorizationResult verify(@NonNull Request request);
}
