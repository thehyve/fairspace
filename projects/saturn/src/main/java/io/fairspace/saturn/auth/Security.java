package io.fairspace.saturn.auth;

import org.eclipse.jetty.security.SecurityHandler;

import java.net.URL;

import static io.fairspace.saturn.auth.TokenValidationSecurityHandler.USER_INFO_REQUEST_ATTRIBUTE;
import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

public class Security {
    public static SecurityHandler createSecurityHandler(URL jwksUrl) {
        return new TokenValidationSecurityHandler(jwksUrl)
            .addConstraintMapping("/health", false)
            .addConstraintMapping("/*", true);
    }

    public static UserInfo userInfo() {
        var connection = getCurrentConnection();
        if (connection == null) {
            return null;
        }
        var request = connection.getHttpChannel().getRequest();
        if (request == null) {
            return null;
        }

        return (UserInfo) request.getAttribute(USER_INFO_REQUEST_ATTRIBUTE);
    }
}
