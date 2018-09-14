package io.fairspace.oidc_auth.filters;

import io.fairspace.oidc_auth.config.AuthConstants;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.servlet.http.HttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;

@ExtendWith(MockitoExtension.class)
public class AuthenticatedCheckAuthenticationFilterTest {

    AuthenticatedCheckAuthenticationFilter filter;
    private OAuthAuthenticationToken token;

    @Mock
    HttpServletRequest request;

    @BeforeEach
    void setUp() {
        filter = new AuthenticatedCheckAuthenticationFilter();
        token = new OAuthAuthenticationToken("access", "refresh");
    }

    @Test
    void testHappyFlow() {
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertTrue(filter.isAuthorized(request));
    }

    @Test
    void testNotAuthorizedWithoutToken() {
        doReturn(null).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertFalse(filter.isAuthorized(request));
    }

}
