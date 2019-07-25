package nl.fairspace.pluto.app.web;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.model.UserInfo;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
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

import static nl.fairspace.pluto.app.config.Urls.EXCHANGE_TOKENS_PATH;
import static nl.fairspace.pluto.app.config.Urls.USERINFO_PATH;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@Profile("noAuth")
@Slf4j
public class NoAuthResource {

    /**
     * GET  /name : returns the name of the user currently logged in
     *
     * @return the login if the user is authenticated
     */
    @GetMapping(USERINFO_PATH)
    public UserInfo getUser() {
        return new UserInfo("0", "mock-user", "Mock User", "Mock", "User", Collections.emptyList());
    }

    /**
     * POST /tokens: exchanges an existing accesstoken and refreshtoken for a sessionid
     *
     * The sessionid can then be used to authenticate calls. Pluto will store the oAuth tokens
     * and refresh the token if needed
     *
     * @return
     */
    @PostMapping(value = EXCHANGE_TOKENS_PATH, consumes = "application/json")
    public Map<String, String> exchangeTokens(@RequestBody ExchangeTokenParams tokenParams, HttpServletRequest request) {
        HttpSession session = request.getSession();
        return Collections.singletonMap("sessionId", base64Encode(session.getId()));
    }

    /**
     * Encode the value using Base64.
     * @param value the String to Base64 encode
     * @return the Base64 encoded value
     */
    private String base64Encode(String value) {
        byte[] encodedCookieBytes = Base64.getEncoder().encode(value.getBytes());
        return new String(encodedCookieBytes);
    }

}
