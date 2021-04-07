package nl.fairspace.pluto.auth;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.*;
import org.mockito.*;
import org.mockito.junit.jupiter.*;

import javax.servlet.http.*;
import java.io.*;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthorizationFailedHandlerTest {
    AuthorizationFailedHandler authorizationFailedHandler;

    @Mock
    HttpServletRequest request ;

    @Mock
    HttpServletResponse response;

    @Mock
    HttpSession session;

    @BeforeEach
    void setUp() {
        authorizationFailedHandler = new AuthorizationFailedHandler();
    }

    @Test
    void testRedirect() throws IOException {
        when(request.getSession()).thenReturn(session);
        when(request.getHeader("Accept")).thenReturn("text/html");
        authorizationFailedHandler.handleFailedAuthorization(request, response);
        verify(response).sendRedirect("/login");
    }

    @Test
    void testRedirectForHtmlAndJson() throws IOException {
        when(request.getSession()).thenReturn(session);
        when(request.getHeader("Accept")).thenReturn("text/html, application/json, other-types");
        authorizationFailedHandler.handleFailedAuthorization(request, response);
        verify(response).sendRedirect("/login");
    }

    @Test
    void testStorageOfCurrentRequestUri() throws IOException {
        when(request.getSession()).thenReturn(session);
        when(request.getHeader("Accept")).thenReturn("text/html");
        when(request.getRequestURI()).thenReturn("http://request-uri");
        authorizationFailedHandler.handleFailedAuthorization(request, response);
        verify(session).setAttribute(AuthConstants.PREVIOUS_REQUEST_SESSION_ATTRIBUTE, "http://request-uri");
    }


    @Test
    void test401ForJsonRequests() throws IOException {
        when(request.getHeader("Accept")).thenReturn("application/json");
        authorizationFailedHandler.handleFailedAuthorization(request, response);
        verify(response).sendError(401);
    }

    @Test
    void test401ForXHRRequests() throws IOException {
        doReturn("text/html").when(request).getHeader("Accept");
        doReturn("XMLHttpRequest").when(request).getHeader("X-Requested-With");
        authorizationFailedHandler.handleFailedAuthorization(request, response);
        verify(response).sendError(401);
    }

    @Test
    void test401WithoutHeaders() throws IOException {
        authorizationFailedHandler.handleFailedAuthorization(request, response);
        verify(response).sendError(401);
    }
}
