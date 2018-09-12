package io.fairspace.oidc_auth.filters;

import lombok.extern.slf4j.Slf4j;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.Arrays;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORITIES_CLAIM;

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
        if(authentication == null || authentication.getClaimsSet() == null) {
            log.debug("No token provided or no claimsset provided");
            return false;
        }

        try {
            boolean hasAuthority = authentication.getAuthorities().contains(requiredAuthority);

            if(!hasAuthority) {
                log.warn("JWT does not contain the required authority {}", requiredAuthority);
            }

            return hasAuthority;
        } catch(ParseException e) {
            log.warn("Could not parse authorities from JWT token");
            return false;
        }

    }
}
