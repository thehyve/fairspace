package io.fairspace.saturn;

import io.fairspace.saturn.auth.UserInfo;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.function.Function;

import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

class SaturnSecurityHandler extends ConstraintSecurityHandler {
    private final Function<HttpServletRequest, UserInfo> authenticator;

    SaturnSecurityHandler(Function<HttpServletRequest, UserInfo> authenticator) {
        this.authenticator = authenticator;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        if (!"/health".equals(pathInContext)) {
            var userInfo = authenticator.apply(request);
            if (userInfo == null) {
                response.sendError(SC_UNAUTHORIZED);
                baseRequest.setHandled(true);
                return;
            }
            // TODO: Check roles
        }
        super.handle(pathInContext, baseRequest, request, response);
    }
}
