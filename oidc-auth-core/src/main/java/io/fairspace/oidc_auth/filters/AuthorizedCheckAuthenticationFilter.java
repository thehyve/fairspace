package io.fairspace.oidc_auth.filters;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;

@Slf4j
public class AuthorizedCheckAuthenticationFilter extends CheckAuthenticationFilter {
    String requiredAuthority;


    public AuthorizedCheckAuthenticationFilter(String requiredAuthority) {
        this.requiredAuthority = requiredAuthority;
    }

    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        // If not specified otherwise, specific authorization is needed,
        // check for that in the authorities list
        OAuthAuthenticationToken authentication = getAuthentication(request);
        if(authentication == null || authentication.getAuthorities() == null) {
            log.debug("No token provided or no authorities provided");
            return false;
        }

        boolean hasAuthority = authentication.getAuthorities().contains(requiredAuthority);

        if(!hasAuthority) {
            log.debug("JWT does not contain the required authority {} for request {}", requiredAuthority, request.getRequestURI());
        }

        return hasAuthority;

    }
}
