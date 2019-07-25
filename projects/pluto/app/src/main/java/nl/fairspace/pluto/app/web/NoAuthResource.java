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
import static nl.fairspace.pluto.app.config.Urls.KEYCLOAK_USERS_PATH;

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
     * GET  /users: returns a map with information about all users
     *
     * The call is being forwarded to the keycloak api for retrieving users
     *
     * @return a list with information on all users in the system.
     * @see <https://www.keycloak.org/docs-api/3.4/rest-api/index.html#_users_resource>
     */
    @GetMapping(value = KEYCLOAK_USERS_PATH, produces = "application/json")
    public ResponseEntity<String> getUsers(HttpServletRequest incomingRequest) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body("[" +
                        "{\"id\":\"b8225d47-e937-41cd-992f-559e9c7b27a3\",\"createdTimestamp\":1543394842832,\"username\":\"coordinator\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"First\",\"lastName\":\"Coordinator\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}," +
                        "{\"id\":\"0d1ca189-2092-4892-b672-f5669c8f5133\",\"createdTimestamp\":1543394865087,\"username\":\"coordinator2-ws\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"Gregor\",\"lastName\":\"Clegane\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}," +
                        "{\"id\":\"4dfd5236-b219-40e0-9fdc-13db33e86bfc\",\"createdTimestamp\":1543394870940,\"username\":\"coordinator3-ws\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"Cersei\",\"lastName\":\"Lannister\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}," +
                        "{\"id\":\"cf2e5b97-0881-4a10-b70c-26ce6e390f4c\",\"createdTimestamp\":1543394839032,\"username\":\"test\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"First\",\"lastName\":\"User\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}," +
                        "{\"id\":\"9a3a8786-ee65-4be7-9246-b0c0bba0c7fe\",\"createdTimestamp\":1543394848665,\"username\":\"test2-ws\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"Test\",\"lastName\":\"User\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}," +
                        "{\"id\":\"8939cb09-4643-4abf-8387-8a966c950043\",\"createdTimestamp\":1543394853039,\"username\":\"user-ws\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"John\",\"lastName\":\"Snow\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}," +
                        "{\"id\":\"0d68d4d2-9cb9-4e7c-a06b-16d36a0527ef\",\"createdTimestamp\":1543394857172,\"username\":\"user2-ws\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"Ygritte\",\"lastName\":\"\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}," +
                        "{\"id\":\"1e861c7f-b968-4476-991f-78ce537abc55\",\"createdTimestamp\":1543394861173,\"username\":\"user3-ws\",\"enabled\":true,\"emailVerified\":false,\"firstName\":\"Daenarys\",\"lastName\":\"Targaryen\",\"access\":{\"manageGroupMembership\":true,\"view\":true,\"mapRoles\":true,\"impersonate\":true,\"manage\":true}}" +
                        "]");
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
