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

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORIZATION_ATTRIBUTE;

@Slf4j
public abstract class CheckAuthenticationFilter implements Filter {
    private AuthorizationFailedHandler failedHandler;

    public CheckAuthenticationFilter(AuthorizationFailedHandler failedHandler) {
        this.failedHandler = failedHandler;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;

        if(!isAuthorized(httpServletRequest)) {
            failedHandler.handleFailedAuthorization(httpServletRequest, (HttpServletResponse) response);
            return;
        }

        chain.doFilter(request, response);
    }

    protected abstract boolean isAuthorized(HttpServletRequest request);

    protected boolean hasAuthentication(HttpServletRequest request) {
        return getAuthentication(request) != null;
    }

    protected OAuthAuthenticationToken getAuthentication(HttpServletRequest request) {
        Object attribute = request.getAttribute(AUTHORIZATION_ATTRIBUTE);

        if(attribute instanceof OAuthAuthenticationToken) {
            return (OAuthAuthenticationToken) attribute;
        } else {
            return null;
        }
    }

    @Override
    public void destroy() {

    }
}
