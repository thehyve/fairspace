package nl.fairspace.pluto.app.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.AuthorizationFailedHandler;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;
import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

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
