package nl.fairspace.pluto.app.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Collection;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/account")
public class AccountResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    /**
     * GET  /authorization : return a map with authorizations for the current user
     *
     * Please note that this call requires the "user-workspace" authorization and
     * will return a 403 otherwise
     *
     * @param authentication the HTTP authentication
     * @return a map with authorizations for the current user.
     */
    @GetMapping("/authorizations")
    public Collection<? extends GrantedAuthority> getAuthorizations(Authentication authentication) {
        log.debug("REST authentication to retrieve authorizations");
        return authentication.getAuthorities();
    }

    /**
     * GET  /name : returns the name of the user currently logged in
     *
     * @param request the HTTP request
     * @return the login if the user is authenticated
     */
    @GetMapping("/name")
    public String getName(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }

}
