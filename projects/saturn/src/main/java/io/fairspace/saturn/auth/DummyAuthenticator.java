package io.fairspace.saturn.auth;

import lombok.AllArgsConstructor;

import javax.servlet.http.HttpServletRequest;
import java.util.Set;
import java.util.function.Function;

// For local development only
@AllArgsConstructor
public class DummyAuthenticator implements Function<HttpServletRequest, UserInfo> {
    private final Set<String> developerRoles;

    @Override
    public UserInfo apply(HttpServletRequest request) {
        // Allow the client to provide some authorities
        String authoritiesHeader = request.getHeader("x-fairspace-authorities");
        Set<String> authorities = authoritiesHeader == null
                ? developerRoles
                : Set.of(authoritiesHeader.split(","));

        return new UserInfo("6e6cde34-45bc-42d8-8cdb-b6e9faf890d3", "test-dummy", "John Snow", "user@example.com", authorities);
    }
}
