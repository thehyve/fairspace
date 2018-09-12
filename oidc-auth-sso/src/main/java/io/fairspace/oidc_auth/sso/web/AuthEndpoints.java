package io.fairspace.oidc_auth.sso.web;

import com.nimbusds.oauth2.sdk.ParseException;
import com.nimbusds.oauth2.sdk.id.State;
import io.fairspace.oidc_auth.config.AuthConstants;
import io.fairspace.oidc_auth.config.OidcConfig;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.oidc_auth.sso.OAuthFlow;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URISyntaxException;

import static io.fairspace.oidc_auth.config.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;
import static io.fairspace.oidc_auth.config.AuthConstants.LOGIN_STATE_SESSION_ATTRIBUTE;
import static io.fairspace.oidc_auth.config.AuthConstants.PREVIOUS_REQUEST_SESSION_ATTRIBUTE;

@Controller
@Slf4j
public class AuthEndpoints {
    private static final String DEFAULT_REDIRECT_LOCATION = "/";

    @Autowired
    OidcConfig configuration;

    @Autowired
    OAuthFlow oAuthFlow;

    @GetMapping("/login")
    public ResponseEntity login(HttpServletRequest request) throws URISyntaxException {
        // Generate random state string for pairing the response to the request
        State state = new State();
        request.getSession().setAttribute(LOGIN_STATE_SESSION_ATTRIBUTE, state.getValue());

        return ResponseEntity
                .status(HttpStatus.SEE_OTHER)
                .header("Location", oAuthFlow.getLoginUri(state).toString())
                .build();
    }

    @GetMapping("/logout")
    public ResponseEntity logout(HttpServletRequest httpServletRequest) {
        // Invalidate current session
        httpServletRequest.getSession().removeAttribute(AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE);
        httpServletRequest.getSession().invalidate();

        // Redirect to auth provider to logout there as well
        return ResponseEntity
                .status(HttpStatus.SEE_OTHER)
                .header("Location", getAuthProviderLogoutUrl())
                .build();
    }

    @GetMapping("/authorize")
    public ResponseEntity authorize(@RequestParam("state") String state, @RequestParam("code") String code, HttpServletRequest httpServletRequest) throws IOException, ParseException, URISyntaxException {
        // Match state to avoid CSRF attacks
        if(state == null || !state.equals(httpServletRequest.getSession().getAttribute(LOGIN_STATE_SESSION_ATTRIBUTE))) {
            log.warn("Provided state parameter does not equal the one stored");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Retrieve the token from the auth provider
        OAuthAuthenticationToken token = oAuthFlow.retrieveToken(code);

        if(token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Store the token in session for future usage
        httpServletRequest.getSession().setAttribute(AUTHORIZATION_SESSION_ATTRIBUTE, token);

        // Redirect the user
        String location = getRedirectLocation(httpServletRequest);
        return ResponseEntity
                .status(HttpStatus.SEE_OTHER)
                .header("Location", location)
                .build();
    }

    private String getRedirectLocation(HttpServletRequest httpServletRequest) {
        String location = (String) httpServletRequest.getSession().getAttribute(PREVIOUS_REQUEST_SESSION_ATTRIBUTE);
        return location != null ? location : DEFAULT_REDIRECT_LOCATION;
    }

    private String getAuthProviderLogoutUrl() {
        return String.format(configuration.getLogoutUri(), configuration.getRedirectAfterLogoutUri());
    }


}
