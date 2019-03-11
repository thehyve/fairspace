package io.fairspace.saturn.auth;

import javax.servlet.http.HttpServletRequest;
import java.util.function.Function;

import static java.util.Collections.emptySet;

// For local development only
public class DummyAuthenticator implements Function<HttpServletRequest, UserInfo> {
    private static final UserInfo DUMMY_USER =
            new UserInfo("123", "test-dummy", "John", "user@example.com", emptySet());

    @Override
    public UserInfo apply(HttpServletRequest httpServletRequest) {
        return DUMMY_USER;
    }
}
