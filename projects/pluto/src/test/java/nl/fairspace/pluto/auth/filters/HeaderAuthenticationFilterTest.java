package nl.fairspace.pluto.auth.filters;

import nl.fairspace.pluto.auth.model.*;
import nl.fairspace.pluto.auth.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.*;
import org.mockito.*;
import org.mockito.junit.jupiter.*;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

import static nl.fairspace.pluto.auth.AuthConstants.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
        doReturn(new OAuthAuthenticationToken("token", "refresh", "id")).when(request).getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);
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
