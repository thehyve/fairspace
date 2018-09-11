package nl.fairspace.pluto.app.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.Map;

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
//    @GetMapping("/authorizations")
//    public List<String> getAuthorizations(Authentication authentication) {
//        log.debug("REST authentication to retrieve authorizations");
//        if(authentication == null || authentication.getAuthorities() == null) {
//            return Collections.emptyList();
//        }
//
//        return authentication.getAuthorities().stream()
//                .map(authority -> ((GrantedAuthority) authority).getAuthority())
//                .collect(Collectors.toList());
//    }

    /**
     * GET  /name : returns the name of the user currently logged in
     *
     * @param request the HTTP request
     * @return the login if the user is authenticated
     */
    @GetMapping("/name")
    public Map<String, String> getName(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return Collections.singletonMap("username", request.getRemoteUser());
    }

}
