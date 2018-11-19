package io.fairspace.oidc_auth;

import io.fairspace.oidc_auth.config.AuthConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
