package io.fairspace.saturn.auth;

import javax.servlet.Filter;
import java.net.URL;

import static io.fairspace.saturn.auth.BearerAuthenticationFilter.USER_INFO_REQUEST_ATTRIBUTE;
import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

public class Security {
    public static Filter createAuthenticationFilter(URL jwksUrl) {
        return new BearerAuthenticationFilter(jwksUrl);
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
