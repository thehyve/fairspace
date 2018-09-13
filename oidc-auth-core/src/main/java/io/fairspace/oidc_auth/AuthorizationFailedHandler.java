package io.fairspace.oidc_auth;

import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static io.fairspace.oidc_auth.config.AuthConstants.PREVIOUS_REQUEST_SESSION_ATTRIBUTE;

@Component
public class AuthorizationFailedHandler {
    public static final String ACCEPT_HEADER = "Accept";
    public static final String X_REQUESTED_WITH_HEADER = "X-Requested-With";
    public static final String XHR_VALUE = "XMLHttpRequest";
    public static final String LOGIN_PATH = "/login";
    public static final String LOGIN_PATH_HEADER = "X-Login-Path";

    public void handleFailedAuthorization(HttpServletRequest request, HttpServletResponse response) throws IOException {
        if (shouldRedirect(request)) {
            request.getSession().setAttribute(PREVIOUS_REQUEST_SESSION_ATTRIBUTE, request.getRequestURI());
            response.sendRedirect(LOGIN_PATH);
        } else {
            response.addHeader(LOGIN_PATH_HEADER, LOGIN_PATH);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        }
    }

    private boolean shouldRedirect(HttpServletRequest request) {
        String acceptHeader = request.getHeader(ACCEPT_HEADER);
        return acceptHeader != null &&
                acceptHeader.contains("text/html") &&
                !XHR_VALUE.equals(request.getHeader(X_REQUESTED_WITH_HEADER));
    }
}
