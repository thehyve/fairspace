package io.fairspace.oidc_auth.sso.filters;

import com.nimbusds.oauth2.sdk.ParseException;
import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.oidc_auth.sso.OAuthFlow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;
import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class SessionAuthenticationFilterTest {

    private SessionAuthenticationFilter filter;

    @Mock
    private JwtTokenValidator tokenValidator;

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
    OAuthAuthenticationToken refreshedToken = new OAuthAuthenticationToken("refreshed-test-token", "refreshed-refresh-token");

    @BeforeEach
    void setUp() {
        filter = new SessionAuthenticationFilter(tokenValidator, oAuthFlow);

        claims = new HashMap<>();
        claims.put("authorities", Collections.singletonList("test"));
    }

    @Test
    void testHappyFlow() throws IOException, ServletException {

        doReturn(session).when(request).getSession();
        doReturn(token).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(claims).when(tokenValidator).parseAndValidate("test-token");
        filter.doFilter(request, response, filterChain);

        verify(request).setAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE, token);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testTokenAlreadyExists() throws IOException, ServletException {
        doReturn(new OAuthAuthenticationToken("token", "refresh-token")).when(request).getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testNoTokenInSession() throws IOException, ServletException {
        doReturn(session).when(request).getSession();
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }


    @Test
    void testInvalidRefreshToken() throws IOException, ServletException {
        doReturn(session).when(request).getSession();
        doReturn(token).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(null).when(tokenValidator).parseAndValidate("test-token");
        doReturn(null).when(tokenValidator).parseAndValidate("refresh-token");
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testValidRefreshToken() throws IOException, ServletException, ParseException {
        doReturn(session).when(request).getSession();
        doReturn(token).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(null).when(tokenValidator).parseAndValidate("test-token");
        doReturn(claims).when(tokenValidator).parseAndValidate("refresh-token");
        doReturn(claims).when(tokenValidator).parseAndValidate("refreshed-test-token");
        doReturn(refreshedToken).when(oAuthFlow).refreshToken(token);

        filter.doFilter(request, response, filterChain);

        OAuthAuthenticationToken finalToken = refreshedToken.toBuilder().claimsSet(claims).build();
        verify(session).setAttribute(AUTHORIZATION_SESSION_ATTRIBUTE, finalToken);
        verify(request).setAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE, finalToken);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testRefreshingFailed() throws IOException, ServletException, ParseException {
        doReturn(session).when(request).getSession();
        doReturn(token).when(session).getAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        doReturn(null).when(tokenValidator).parseAndValidate("test-token");
        doReturn(claims).when(tokenValidator).parseAndValidate("refresh-token");
        doReturn(refreshedToken).when(oAuthFlow).refreshToken(token);
        doReturn(null).when(tokenValidator).parseAndValidate("refreshed-test-token");

        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }


}
