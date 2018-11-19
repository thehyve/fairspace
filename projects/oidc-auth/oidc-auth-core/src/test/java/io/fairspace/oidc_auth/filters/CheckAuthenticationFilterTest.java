package io.fairspace.oidc_auth.filters;

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

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
public class CheckAuthenticationFilterTest {
    CheckAuthenticationFilter filter;

    @Mock
    HttpServletRequest request;

    @Mock
    HttpServletResponse response;

    @Mock
    FilterChain filterChain;

    private boolean isAuthorized = true;

    @BeforeEach
    void setUp() {
        filter = new CheckAuthenticationFilter() {
            @Override
            protected boolean isAuthorized(HttpServletRequest request) {
                return isAuthorized;
            }
        };

        isAuthorized = true;
    }

    @Test
    void testFilterStoresAuthorizationResult() throws IOException, ServletException {
        filter.doFilter(request, response, filterChain);

        verify(request).setAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE, Boolean.TRUE);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testFilterStopsOnFailedAuthentication() throws IOException, ServletException {
        isAuthorized = false;
        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(any(), any());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testFilterSkipsOnExistingResult() throws IOException, ServletException {
        doReturn(Boolean.TRUE).when(request).getAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE);
        filter = new CheckAuthenticationFilter() {
            @Override
            protected boolean isAuthorized(HttpServletRequest request) {
                throw new RuntimeException("this method should not be called");
            }
        };

        filter.doFilter(request, response, filterChain);

        verify(request, times(0)).setAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE, Boolean.TRUE);
        verify(filterChain).doFilter(request, response);
    }

}
