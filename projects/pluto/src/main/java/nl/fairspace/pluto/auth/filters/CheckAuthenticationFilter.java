package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.*;
import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.model.*;

import javax.servlet.*;
import javax.servlet.http.*;
import java.io.*;

import static nl.fairspace.pluto.auth.AuthConstants.*;
import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;

/**
 * Base filter class that will mark a request as authorized if a certain condition holds. The condition
 * is to be implemented by subclasses in the {@link CheckAuthenticationFilter#isAuthorized(HttpServletRequest)} method
 *
 * It will add an attribute called {@link AuthConstants#AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE}
 * to the current request, set to true
 */
@Slf4j
public abstract class CheckAuthenticationFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) {

    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if(Boolean.TRUE.equals(request.getAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE))) {
            chain.doFilter(request, response);
            return;
        }

        HttpServletRequest httpServletRequest = (HttpServletRequest) request;

        if(isAuthorized(httpServletRequest)) {
            // Save authorization check result
            request.setAttribute(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE, Boolean.TRUE);
        }

        chain.doFilter(request, response);
    }

    protected abstract boolean isAuthorized(HttpServletRequest request);

    protected boolean hasAuthentication(HttpServletRequest request) {
        return getAuthentication(request) != null;
    }

    protected OAuthAuthenticationToken getAuthentication(HttpServletRequest request) {
        Object attribute = request.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE);

        if (attribute instanceof OAuthAuthenticationToken) {
            return (OAuthAuthenticationToken) attribute;
        } else {
            return null;
        }
    }

    @Override
    public void destroy() {

    }
}
