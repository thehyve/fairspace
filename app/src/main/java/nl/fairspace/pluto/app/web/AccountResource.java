package nl.fairspace.pluto.app.web;

import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/account")
@Profile("!noAuth")
public class AccountResource {
    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @Autowired
    OAuthAuthenticationToken token;

    /**
     * GET  /authorization : return a map with authorizations for the current user
     *
     * Please note that this call requires the "user-workspace" authorization and
     * will return a 403 otherwise
     *
     * @return a map with authorizations for the current user.
     */
    @GetMapping("/authorizations")
    public List<String> getAuthorizations() throws ParseException {
        log.debug("REST authentication to retrieve authorizations");
        if(token == null) {
            return Collections.emptyList();
        }

        return token.getAuthorities();
    }

    /**
     * GET  /name : returns the name of the user currently logged in
     *
     * @return the login if the user is authenticated
     */
    @GetMapping("/name")
    public Map<String, String> getName() {
        log.debug("REST request to check if the current user is authenticated");
        return Collections.singletonMap("username", token.getFullName());
    }

}
