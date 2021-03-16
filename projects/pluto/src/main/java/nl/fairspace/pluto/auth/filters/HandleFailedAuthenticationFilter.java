package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.*;
import nl.fairspace.pluto.auth.*;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

import static nl.fairspace.pluto.auth.AuthConstants.*;

/**
 * This filter will check whether any other filter has marked the request as authorized. If not, a handler is called
 * to mark the request as unauthorized
 *
 * To pass this filter, the request should have an attribute called {@link AuthConstants#AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE},
 * set to true
 */
@Slf4j
public class HandleFailedAuthenticationFilter implements Filter {
    private AuthorizationFailedHandler failedHandler;

    public HandleFailedAuthenticationFilter(AuthorizationFailedHandler failedHandler) {
        this.failedHandler = failedHandler;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if(!Boolean.TRUE.equals(request.getAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE))) {
            failedHandler.handleFailedAuthorization((HttpServletRequest) request, (HttpServletResponse) response);
            return;
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {

    }
}
