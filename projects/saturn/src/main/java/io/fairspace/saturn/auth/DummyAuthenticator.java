package io.fairspace.saturn.auth;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

import static java.util.Collections.emptySet;

// For local development only
public class DummyAuthenticator implements Function<HttpServletRequest, UserInfo> {
    private static final UserInfo DUMMY_USER =
            new UserInfo("123", "test-dummy", "John", "user@example.com", emptySet());

    @Override
    public UserInfo apply(HttpServletRequest request) {
        // Allow the client to provide some authorities
            String authoritiesHeader = request.getHeader("x-fairspace-authorities");
        Set<String> authorities = authoritiesHeader == null
                ? emptySet()
                : Set.of(authoritiesHeader.split(","));

        UserInfo dummyUser = new UserInfo("123", "test-dummy", "John", "user@example.com", authorities);

        request.setAttribute(SecurityUtil.USER_INFO_REQUEST_ATTRIBUTE, dummyUser);
        return DUMMY_USER;
    }
}
