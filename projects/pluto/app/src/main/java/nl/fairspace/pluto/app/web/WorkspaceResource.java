package nl.fairspace.pluto.app.web;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.config.dto.FrontendConfig;
import nl.fairspace.pluto.app.config.dto.WorkspaceDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.nio.charset.Charset;

import static nl.fairspace.pluto.app.config.Urls.WORKSPACE_CONFIG_PATH;
import static nl.fairspace.pluto.app.config.Urls.WORKSPACE_DETAILS_PATH;
import static nl.fairspace.pluto.app.config.Urls.WORKSPACE_USERS_PATH;

/**
 * REST controller for managing workspace contents
 */
@RestController
@Slf4j
@Profile("!noAuth")
public class WorkspaceResource {
    @Autowired
    FrontendConfig frontendConfig;

    @Autowired
    WorkspaceDetails workspaceDetails;

    @Autowired
    KeycloakUserList keycloakUserList;

    /**
     * GET  /config: returns a map with configuration options relevant for the frontend
     *
     * @return a map with configuration options relevant for the frontend
     */
    @GetMapping(value = WORKSPACE_CONFIG_PATH, produces = "application/json")
    public FrontendConfig getConfiguration(HttpServletRequest incomingRequest) {
        return frontendConfig;
    }

    /**
     * GET  /users: returns a map with information about all users
     *
     * The call is being forwarded to the keycloak api for retrieving users
     *
     * @return a list with information on all users in the system.
     * @see <https://www.keycloak.org/docs-api/4.0/rest-api/index.html#_getusersinrole>
     */
    @GetMapping(value = WORKSPACE_USERS_PATH, produces = "application/json")
    public ResponseEntity<String> getUsers(HttpServletRequest incomingRequest) {
        return keycloakUserList.getUsers(incomingRequest.getQueryString());
    }

    /**
     * GET  /details: returns a map with workspace details (name, version)
     *
     * @return a map with workspace details
     */
    @GetMapping(value = WORKSPACE_DETAILS_PATH, produces = "application/json")
    public WorkspaceDetails getDetails() {
        return workspaceDetails;
    }

}
