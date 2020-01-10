package io.fairspace.saturn.auth;

import lombok.AllArgsConstructor;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static io.fairspace.saturn.auth.OAuthAuthenticationToken.*;


// For local development only
@AllArgsConstructor
public class DummyAuthenticator implements Function<HttpServletRequest, OAuthAuthenticationToken> {
    private final List<String> developerRoles;

    @Override
    public OAuthAuthenticationToken apply(HttpServletRequest request) {
        // Allow the client to provide some authorities
        var authoritiesHeader = request.getHeader("x-fairspace-authorities");
        var authorities = authoritiesHeader == null
                ? developerRoles
                : List.of(authoritiesHeader.split(","));

        return new OAuthAuthenticationToken("<token>", Map.of(
                SUBJECT_CLAIM, "6e6cde34-45bc-42d8-8cdb-b6e9faf890d3",
                USERNAME_CLAIM, "test-dummy",
                FULLNAME_CLAIM, "John Snow",
                EMAIL_CLAIM, "user@example.com",
                AUTHORITIES_CLAIM, authorities));
    }
}
