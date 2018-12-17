package io.fairspace.oidc_auth.filters;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;
import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

@Slf4j
public abstract class CheckAuthenticationFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

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
