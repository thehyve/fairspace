package io.fairspace.oidc_auth.bearer_auth.filters;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class HeaderAuthenticationFilterTest {

    private HeaderAuthenticationFilter filter;

    @Mock
    private JwtTokenValidator tokenValidator;

    @Mock
    HttpServletRequest request;

    @Mock
    HttpServletResponse response;

    @Mock
    FilterChain filterChain;

    Map<String,Object> claims;

    @BeforeEach
    void setUp() {
        filter = new HeaderAuthenticationFilter(tokenValidator);
        claims = new HashMap<>();
        claims.put("authorities", Collections.singletonList("test"));
    }

    @Test
    void testHappyFlow() throws IOException, ServletException {
        doReturn("Bearer test-token").when(request).getHeader("Authorization");
        doReturn(claims).when(tokenValidator).parseAndValidate("test-token");
        filter.doFilter(request, response, filterChain);

        verifyResponseClaims(response, claims);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testTokenAlreadyExists() throws IOException, ServletException {
        doReturn(new OAuthAuthenticationToken("token", "refresh")).when(request).getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testInvalidToken() throws IOException, ServletException {
        doReturn("Bearer test-token").when(request).getHeader("Authorization");
        doReturn(null).when(tokenValidator).parseAndValidate("test-token");
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }

    private void verifyResponseClaims(HttpServletResponse response, Map<String, Object> claims) {
        verify(request).setAttribute(eq(AUTHORIZATION_REQUEST_ATTRIBUTE), argThat(argument -> {
            OAuthAuthenticationToken token = (OAuthAuthenticationToken) argument;
            return token.getClaimsSet().equals(claims);
        }));
    }
}
