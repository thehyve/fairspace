package io.fairspace.oidc_auth.filters;

import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;

@Slf4j
public class AnonymousCheckAuthenticationFilter extends CheckAuthenticationFilter {
    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        return true;
    }
}
