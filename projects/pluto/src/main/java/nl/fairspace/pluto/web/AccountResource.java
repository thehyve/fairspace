package nl.fairspace.pluto.web;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.model.*;
import nl.fairspace.pluto.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;
import static nl.fairspace.pluto.config.Urls.EXCHANGE_TOKENS_PATH;
import static nl.fairspace.pluto.config.Urls.USERINFO_PATH;
import static nl.fairspace.pluto.auth.model.OAuthAuthenticationToken.*;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@Profile("!noAuth")
@Slf4j
public class AccountResource {
    @Autowired(required = false)
    OAuthAuthenticationToken token;

    @Autowired
    JwtTokenValidator jwtTokenValidator;

    /**
     * GET  /api/account : returns the name of the user currently logged in
     *
     * @return the login if the user is authenticated
     */
    @GetMapping(USERINFO_PATH)
    public UserInfo getUser() {
        log.trace("REST request to check if the current user is authenticated");
        if (token == null) {
            log.warn("No token found in account/user call");
            return new UserInfo();
        } else {
            return new UserInfo(
                    token.getStringClaim(SUBJECT_CLAIM),
                    token.getUsername(),
                    token.getFullName(),
                    token.getStringClaim(FIRSTNAME_CLAIM),
                    token.getStringClaim(LASTNAME_CLAIM),
                    token.getAuthorities()
            );
        }
    }

    /**
     * POST /api/account/tokens: exchanges an existing accesstoken and refreshtoken for a sessionid
     * <p>
     * The sessionid can then be used to authenticate calls. Pluto will store the oAuth tokens
     * and refresh the token if needed
     *
     * @return
     */
    @PostMapping(value = EXCHANGE_TOKENS_PATH, consumes = "application/json")
    public ResponseEntity<Map<String, String>> exchangeTokens(@RequestBody ExchangeTokenParams tokenParams, HttpServletRequest request) {
        HttpSession session = request.getSession();

        log.trace("REST request to exchange tokens. Tokens stored: {}", tokenParams);

        // Validate the token. If it validates, a claimsset will be returned
        Map<String, Object> claims = jwtTokenValidator.parseAndValidate(tokenParams.getAccessToken());

        if (claims == null) {
            log.warn("Trying to exchange invalid token for a session identifier");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        // Generate new token object and store it in session
        OAuthAuthenticationToken token = new OAuthAuthenticationToken(tokenParams.getAccessToken(), tokenParams.getRefreshToken(), claims);
        session.setAttribute(AUTHORIZATION_SESSION_ATTRIBUTE, token);
        session.setMaxInactiveInterval(-1);

        // Return the session id explicitly
        return ResponseEntity.status(HttpStatus.OK).body(Collections.singletonMap("sessionId", base64Encode(session.getId())));
    }

    /**
     * Encode the value using Base64.
     *
     * @param value the String to Base64 encode
     * @return the Base64 encoded value
     */
    private String base64Encode(String value) {
        byte[] encodedCookieBytes = Base64.getEncoder().encode(value.getBytes());
        return new String(encodedCookieBytes);
    }
}
