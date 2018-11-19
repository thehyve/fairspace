package io.fairspace.oidc_auth.filters;

import io.fairspace.oidc_auth.config.AuthConstants;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORITIES_CLAIM;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

@ExtendWith(MockitoExtension.class)
public class AuthorizedCheckAuthenticationFilterTest {

    AuthorizedCheckAuthenticationFilter filter;
    private String requiredAuthority = "login";
    private OAuthAuthenticationToken token;
    private Map<String, Object> claims;

    @Mock
    HttpServletRequest request;

    @BeforeEach
    void setUp() {
        filter = new AuthorizedCheckAuthenticationFilter(requiredAuthority);
        claims = new HashMap<>();
        token = new OAuthAuthenticationToken("access", "refresh", claims);
    }

    @Test
    void testHappyFlow() {
        claims.put(AUTHORITIES_CLAIM, Collections.singletonList(requiredAuthority));
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertTrue(filter.isAuthorized(request));
    }

    @Test
    void testNotAuthorizedWithoutToken() {
        doReturn(null).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertFalse(filter.isAuthorized(request));
    }

    @Test
    void testNotAuthorizedWithoutCorrectAuthority() {
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);
        assertFalse(filter.isAuthorized(request));
    }
}
