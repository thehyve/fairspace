package nl.fairspace.pluto.auth.filters;

import lombok.extern.slf4j.*;
import nl.fairspace.pluto.auth.*;

import javax.servlet.http.*;

/**
 * This filter will mark every request as authorized.
 *
 * It will add an attribute called {@link AuthConstants#AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE}
 * to the current request, set to true
 *
 * @see CheckAuthenticationFilter
 */
@Slf4j
public class AnonymousCheckAuthenticationFilter extends CheckAuthenticationFilter {
    @Override
    protected boolean isAuthorized(HttpServletRequest request) {
        return true;
    }
}
