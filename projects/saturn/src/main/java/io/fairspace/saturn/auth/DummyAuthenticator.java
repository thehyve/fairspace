package io.fairspace.saturn.auth;

import javax.servlet.http.HttpServletRequest;
import java.util.function.Function;

import static java.util.Collections.emptySet;

// For local development only
public class DummyAuthenticator implements Function<HttpServletRequest, UserInfo> {
    private static final UserInfo DUMMY_USER =
            new UserInfo("123", "test-dummy", "John", "user@example.com", emptySet());

    @Override
    public UserInfo apply(HttpServletRequest request) {
        request.setAttribute(SecurityUtil.USER_INFO_REQUEST_ATTRIBUTE, DUMMY_USER);
        return DUMMY_USER;
    }
}
