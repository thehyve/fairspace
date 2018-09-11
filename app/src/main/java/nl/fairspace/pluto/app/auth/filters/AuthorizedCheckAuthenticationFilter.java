package nl.fairspace.pluto.app.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.Arrays;

import static nl.fairspace.pluto.app.auth.config.AuthConstants.AUTHORITIES_CLAIM;

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
            String[] authorities = authentication.getClaimsSet().getStringArrayClaim(AUTHORITIES_CLAIM);
            boolean hasAuthority = Arrays.asList(authorities).contains(requiredAuthority);

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
