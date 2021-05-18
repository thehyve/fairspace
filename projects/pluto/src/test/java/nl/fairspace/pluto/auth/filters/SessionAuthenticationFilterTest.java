package nl.fairspace.pluto.auth.filters;

import com.nimbusds.oauth2.sdk.*;
import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.model.*;
import org.junit.*;
import org.junit.runner.*;
import org.mockito.*;
import org.mockito.junit.*;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

import static nl.fairspace.pluto.auth.AuthConstants.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class SessionAuthenticationFilterTest {

    private SessionAuthenticationFilter filter;

    @Mock
    private JwtTokenValidator accessTokenValidator;

    @Mock
    private OAuthFlow oAuthFlow;

    @Mock
    HttpServletRequest request;

    @Mock
    HttpServletResponse response;

    @Mock
    FilterChain filterChain;

    @Mock
    HttpSession session;

    Map<String,Object> claims;
    OAuthAuthenticationToken token = new OAuthAuthenticationToken("test-token", "refresh-token");
    OAuthAuthenticationToken tokenWithClaims;
    OAuthAuthenticationToken refreshedToken = new OAuthAuthenticationToken("refreshed-test-token", "refreshed-refresh-token");
    OAuthAuthenticationToken tokenWithoutRefreshToken = new OAuthAuthenticationToken("test-token", (String) null);

    @Before
    public void setUp() {
        filter = new SessionAuthenticationFilter(accessTokenValidator, oAuthFlow);

        claims = new HashMap<>();
        claims.put("authorities", Collections.singletonList("test"));

        tokenWithClaims = token.toBuilder().claimsSet(claims).build();
    }

    @Test
    public void testHappyFlow() throws IOException, ServletException {

        doReturn(session).when(request).getSession();
        doReturn(token).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(claims).when(accessTokenValidator).parseAndValidate("test-token");
        filter.doFilter(request, response, filterChain);

        verify(request).setAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE, tokenWithClaims);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void testTokenAlreadyExists() throws IOException, ServletException {
        doReturn(new OAuthAuthenticationToken("token", "refresh-token")).when(request).getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void testNoTokenInSession() throws IOException, ServletException {
        doReturn(session).when(request).getSession();
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }


    @Test
    public void testInvalidRefreshToken() throws IOException, ServletException {
        doReturn(session).when(request).getSession();
        doReturn(tokenWithoutRefreshToken).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(null).when(accessTokenValidator).parseAndValidate("test-token");
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void testValidRefreshToken() throws IOException, ServletException, ParseException {
        doReturn(session).when(request).getSession();
        doReturn(token).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(null).when(accessTokenValidator).parseAndValidate("test-token");
        doReturn(claims).when(accessTokenValidator).parseAndValidate("refreshed-test-token");
        doReturn(refreshedToken).when(oAuthFlow).refreshToken(token);

        filter.doFilter(request, response, filterChain);

        OAuthAuthenticationToken finalToken = refreshedToken.toBuilder().claimsSet(claims).build();
        verify(session).setAttribute(AUTHORIZATION_SESSION_ATTRIBUTE, finalToken);
        verify(request).setAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE, finalToken);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    public void testRefreshingFailed() throws IOException, ServletException, ParseException {
        doReturn(session).when(request).getSession();
        doReturn(token).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(null).when(accessTokenValidator).parseAndValidate("test-token");
        doReturn(refreshedToken).when(oAuthFlow).refreshToken(token);
        doReturn(null).when(accessTokenValidator).parseAndValidate("refreshed-test-token");

        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }
}
