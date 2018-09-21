package nl.fairspace.pluto.app.web;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.model.UserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static io.fairspace.oidc_auth.model.OAuthAuthenticationToken.FIRSTNAME_CLAIM;
import static io.fairspace.oidc_auth.model.OAuthAuthenticationToken.LASTNAME_CLAIM;
import static io.fairspace.oidc_auth.model.OAuthAuthenticationToken.SUBJECT_CLAIM;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/account")
@Profile("!noAuth")
@Slf4j
public class AccountResource {
    @Autowired(required = false)
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
            log.warn("No token found in account/authorizations call");
            return Collections.emptyList();
        }

        return token.getAuthorities();
    }

    /**
     * GET  /name : returns the name of the user currently logged in
     *
     * @return the login if the user is authenticated
     */
    @GetMapping("/user")
    public UserInfo getUser() {
        log.debug("REST request to check if the current user is authenticated");
        if(token == null) {
            log.warn("No token found in account/user call");
            return new UserInfo();
        } else {
            return new UserInfo(
                    token.getStringClaim(SUBJECT_CLAIM),
                    token.getUsername(),
                    token.getFullName(),
                    token.getStringClaim(FIRSTNAME_CLAIM),
                    token.getStringClaim(LASTNAME_CLAIM)
            );
        }
    }

}
