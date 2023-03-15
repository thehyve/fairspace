package nl.fairspace.pluto.auth.web;

import com.nimbusds.oauth2.sdk.*;
import com.nimbusds.oauth2.sdk.id.*;
import lombok.extern.slf4j.*;
import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.config.*;
import nl.fairspace.pluto.auth.model.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.http.*;
import org.springframework.stereotype.*;
import org.springframework.util.*;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.*;
import java.io.*;
import java.net.*;

import static nl.fairspace.pluto.auth.AuthConstants.*;

@Controller
@Slf4j
public class AuthEndpoints {
    private static final String DEFAULT_REDIRECT_LOCATION = "/";

    @Autowired
    OidcConfig configuration;

    @Autowired
    OAuthFlow oAuthFlow;

    @Autowired(required = false)
    OAuthAuthenticationToken authenticationToken;

    @GetMapping("/login")
    public ResponseEntity<Void> login(
            @RequestParam(name = "redirectUrl", required = false) String redirectUrl,
            HttpServletRequest request) throws URISyntaxException {
        // Generate random state string for pairing the response to the request
        State state = new State();
        request.getSession().setAttribute(LOGIN_STATE_SESSION_ATTRIBUTE, state.getValue());

        // If a redirectUrl is specified, store it to use later on
        if (StringUtils.hasText(redirectUrl)) {
            request.getSession().setAttribute(PREVIOUS_REQUEST_SESSION_ATTRIBUTE, redirectUrl);
        }

        return ResponseEntity
                .status(HttpStatus.SEE_OTHER)
                .header("Location", oAuthFlow.getLoginUri(state).toString())
                .build();
    }

    @GetMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpServletRequest) {
        // Invalidate current session
        httpServletRequest.getSession().removeAttribute(AUTHORIZATION_SESSION_ATTRIBUTE);
        httpServletRequest.getSession().invalidate();

        // Redirect to auth provider to logout there as well
        return ResponseEntity
                .status(HttpStatus.SEE_OTHER)
                .header("Location", getAuthProviderLogoutUrl())
                .build();
    }

    @GetMapping("/authorize")
    public ResponseEntity<Void> authorize(@RequestParam("state") String state, @RequestParam("code") String code, HttpServletRequest httpServletRequest) throws IOException, ParseException, URISyntaxException {
        // Match state to avoid CSRF attacks
        if (state == null || !state.equals(httpServletRequest.getSession().getAttribute(LOGIN_STATE_SESSION_ATTRIBUTE))) {
            log.warn("Provided state parameter does not equal the one stored");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Retrieve the token from the auth provider
        OAuthAuthenticationToken token = oAuthFlow.retrieveToken(code);

        if (token == null) {
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
        return String.format(configuration.getLogoutUrl(), configuration.getRedirectAfterLogoutUrl(), authenticationToken.getIdToken());
    }
}
