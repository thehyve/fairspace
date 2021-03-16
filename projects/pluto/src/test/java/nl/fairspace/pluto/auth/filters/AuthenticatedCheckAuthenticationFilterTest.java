package nl.fairspace.pluto.auth.filters;

import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.filters.*;
import nl.fairspace.pluto.auth.model.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.*;
import org.mockito.*;
import org.mockito.junit.jupiter.*;

import javax.servlet.http.*;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.*;

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
