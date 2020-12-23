package io.fairspace.saturn.auth;

import org.eclipse.jetty.http.*;
import org.eclipse.jetty.server.*;
import org.eclipse.jetty.server.handler.*;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

public class ProxiedRequestHandler extends HandlerWrapper {
    static class ProxiedRequestWrapper extends HttpServletRequestWrapper {
        /**
         * Constructs a request object wrapping the given request,
         * which reads the X-Forwarded-Proto header from the request, if set,
         * and uses that value to determine the scheme and the security of the request.
         *
         * @param request the original request
         * @throws IllegalArgumentException if the request is null
         */
        public ProxiedRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public boolean isSecure() {
            return super.isSecure() || HttpScheme.HTTPS.name().equalsIgnoreCase(this.getScheme());
        }

        @Override
        public String getScheme() {
            var protocol = this.getHeader("x-forwarded-proto");
            if (protocol != null) {
                return protocol;
            }
            return super.getScheme();
        }
    }

    @Override
    public void handle(String target, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        new ProxiedRequestWrapper(request).getScheme();
        new ProxiedRequestWrapper(request).isSecure();
        super.handle(target, baseRequest, new ProxiedRequestWrapper(request), response);
    }
}
