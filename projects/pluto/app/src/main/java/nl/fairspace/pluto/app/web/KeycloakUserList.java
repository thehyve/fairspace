package nl.fairspace.pluto.app.web;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.app.config.dto.KeycloakConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.Charset;
import java.util.List;

/**
 * List of users in keycloak, to be returned to the frontend
 *
 * This class handles keycloak configuration for retrieving the list of users for the
 * current workspace. Keycloak does not provide a method to return a list of users for
 * a given role. For that reason, we retrieve the list of users by group.
 */
@Slf4j
@Profile("!noAuth")
@Component
public class KeycloakUserList {
    @Autowired
    KeycloakConfig config;

    @Autowired(required = false)
    OAuthAuthenticationToken token;

    private final RestTemplate restTemplate;
    private String groupId = null;

    public KeycloakUserList() {
        this.restTemplate = new RestTemplate() {{
            getMessageConverters()
                    .add(0, new StringHttpMessageConverter(Charset.forName("UTF-8")));
        }};
    }

    /**
     * Constructor which enables injecting a custom restTemplate and configuration
     * @param restTemplate
     */
    KeycloakUserList(RestTemplate restTemplate, KeycloakConfig config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }

    /**
     * Retrieves information on the users for the current workspace
     *
     * The call is being forwarded to the keycloak api for retrieving users
     *
     * @return a list with information on all users in the group for the current workspace
     * @see <https://www.keycloak.org/docs-api/4.0/rest-api/index.html#_getmembers>
     */
    @GetMapping(value = "/users", produces = "application/json")
    public ResponseEntity<String> getUsers(String queryString) {
        // Forward the request, without any headers except for the Authorization
        // header. Keycloak will not return a valid response if some headers are
        // forwarded (e.g. Host or X-Forwarded-Host)
        HttpHeaders headers = new HttpHeaders();

        if(token != null) {
            log.trace("Adding authorization header for user retrieval");
            headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + token.getAccessToken());
        }

        HttpEntity<Object> request = new HttpEntity<>(headers);

        // Send the request upstream
        try {
            // Pass along the full query string
            String uri = String.format(config.getUsersUriPattern(), getGroupId(), queryString);

            log.trace("Retrieving users from {}", uri);
            return restTemplate.exchange(uri, HttpMethod.GET, request, String.class);
        } catch(HttpClientErrorException e) {
            log.warn("Client error while retrieving list of users from Auth provider", e);
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch(Exception e) {
            log.error("An exception occurred while retrieving list of users from Auth provider", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Returns the keycloak group identifier
     * @return
     */
    String getGroupId() {
        // Retrieve the groupId, if it has not been retrieved before
        // As it will never change, we will cache it forever
        if(groupId == null) {
            log.info("Retrieve group identifier for keycloak user group at {}", config.getGroupUri());

            HttpHeaders headers = new HttpHeaders();

            if(token != null) {
                log.trace("Adding authorization header for user retrieval: {}",token.getAccessToken());
                headers.add(HttpHeaders.AUTHORIZATION, "Bearer " + token.getAccessToken());
            }

            HttpEntity<Object> request = new HttpEntity<>(headers);

            ParameterizedTypeReference<List<GroupInfo>> parameterizedTypeReference = new ParameterizedTypeReference<>(){};
            ResponseEntity<List<GroupInfo>> groupResponse = restTemplate.exchange(config.getGroupUri(), HttpMethod.GET, request, parameterizedTypeReference);

            if(groupResponse.getStatusCode().is2xxSuccessful() && groupResponse.getBody().size() > 0) {
                // Keycloak may return multiple groups, as there may be groups with similar names to the one
                // being sought. For example, if we search for 'group-workspace', then it may return 'group-workspace2' as well
                // For that reason we search the list to find the group with a matching name.
                groupId = groupResponse.getBody().stream()
                        .filter(groupInfo -> config.getWorkspaceLoginGroup().equals(groupInfo.getName()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("None of the returned groups from keycloak matches the requested name"))
                        .getId();
            } else {
                log.warn("Could not retrieve group identifier from keycloak on url {}: status {}", config.getGroupUri(), groupResponse.getStatusCodeValue());
                throw new IllegalStateException("Could not retrieve group identifier from keycloak");
            }
        }

        return groupId;
    }

    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    static class GroupInfo {
        private String id = null;
        private String name = null;
    }
}
