package io.fairspace.saturn;

import io.fairspace.saturn.auth.UserInfo;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.function.Consumer;
import java.util.function.Function;

import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

class SaturnSecurityHandler extends ConstraintSecurityHandler {
    private final Function<HttpServletRequest, UserInfo> authenticator;
    private final Consumer<UserInfo> userCallback ;

    /**
     *
     * @param authenticator Authenticator returning a UserInfo for an incoming request
     * @param onAuthenticate An optional callback, called on successful authentication
     */
    SaturnSecurityHandler(Function<HttpServletRequest, UserInfo> authenticator, Consumer<UserInfo> onAuthenticate) {
        this.authenticator = authenticator;
        this.userCallback = onAuthenticate;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        if (!"/api/v1/health/".equals(pathInContext)) {
            var userInfo = authenticator.apply(request);
            if (userInfo == null) {
                response.sendError(SC_UNAUTHORIZED);
                baseRequest.setHandled(true);
                return;
            }
            if (userCallback != null) {
                userCallback.accept(userInfo);
            }

            // TODO: Check roles
        }
        super.handle(pathInContext, baseRequest, request, response);
    }
}
