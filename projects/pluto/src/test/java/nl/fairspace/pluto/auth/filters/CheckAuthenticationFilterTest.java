package nl.fairspace.pluto.auth.filters;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.*;
import org.mockito.*;
import org.mockito.junit.jupiter.*;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

import static nl.fairspace.pluto.auth.AuthConstants.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
