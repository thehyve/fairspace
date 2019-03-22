package io.fairspace.saturn.auth;

import lombok.AllArgsConstructor;
import lombok.NonNull;
import spark.Request;

import java.util.Set;
import java.util.function.Supplier;

/**
 * Verifies the authorization for vocabulary editing
 */
@AllArgsConstructor
public class VocabularyAuthorizationVerifier implements AuthorizationVerifier {
    private static final Set<String> RESTRICTED_METHODS = Set.of("PUT", "PATCH", "DELETE");

    private final Supplier<UserInfo> userInfoSupplier;
    private final String dataStewardRole;

    @Override
    public AuthorizationResult verify(@NonNull Request request) {
        if(RESTRICTED_METHODS.contains(request.requestMethod())) {
            return hasDataStewardAccess()
                    ? AuthorizationResult.AUTHORIZED
                    : AuthorizationResult.notAuthorized("Vocabulary updates are only allowed by data stewards");

        } else {
            return AuthorizationResult.AUTHORIZED;
        }
    }

    private boolean hasDataStewardAccess() {
        UserInfo userInfo = userInfoSupplier.get();
        return userInfo != null &&  userInfo.getAuthorities().contains(dataStewardRole);
    }
}
