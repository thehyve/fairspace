package nl.fairspace.pluto.app.web;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.auth.model.OAuthAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Map;

/**
 * REST controller for managing workspace contents
 */
@RestController
@Slf4j
@RequestMapping("/api/workspace")
public class WorkspaceResource {
    @Value("${workspace.usersUri}")
    URI usersUri;

    @Autowired
    OAuthAuthenticationToken token;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * GET  /users: returns a map with information about all users
     *
     * The call is being forwarded to the keycloak api for retrieving users
     *
     * @return a list with information on all users in the system.
     * @see <https://www.keycloak.org/docs-api/3.4/rest-api/index.html#_users_resource>
     */
    @GetMapping(value = "/users", produces = "application/json")
    public String getUsers() {
        // Forward the request, without any headers except for the Authorization
        // header. Keycloak will not return a valid response if some headers are
        // forwarded (e.g. Host or X-Forwarded-Host)
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + token.getAccessToken());
        HttpEntity<Object> request = new HttpEntity<>(headers);

        return restTemplate.exchange(usersUri, HttpMethod.GET, request, String.class).getBody();
    }
}
