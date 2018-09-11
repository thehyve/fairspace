package nl.fairspace.pluto.app.auth.filters;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.AuthorizationFailedHandler;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.Arrays;

@Slf4j
public class AuthorizedCheckAuthenticationFilter extends CheckAuthenticationFilter {
    public static final String AUTHORITIES_CLAIM = "authorities";

    String requiredAuthority;

    public AuthorizedCheckAuthenticationFilter(AuthorizationFailedHandler failedHandler, String requiredAuthority) {
        super(failedHandler);
        this.requiredAuthority = requiredAuthority;
    }

    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        // If not specified otherwise, specific authorization is needed,
        // check for that in the authorities list
        OAuthAuthenticationToken authentication = getAuthentication(request);
        if(authentication == null) {
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
