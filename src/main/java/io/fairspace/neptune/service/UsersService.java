package io.fairspace.neptune.service;

import io.fairspace.neptune.model.KeycloakUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class UsersService {
    private final RestTemplate restTemplate;
    private final String usersEndpoint;

    @Autowired
    public UsersService(RestTemplate restTemplate,
                        @Value("${app.oauth2.base-url}/auth/admin/realms/${app.oauth2.realm}/users") String usersEndpoint
    ) {
        this.restTemplate = restTemplate;
        this.usersEndpoint = usersEndpoint;
    }

    public List<KeycloakUser> getUsers() throws IOException {
        // TODO: Implement caching
        try {
            return restTemplate.exchange(
                    usersEndpoint,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<KeycloakUser>>(){}
                    ).getBody();
        } catch (Exception e) {
            log.error(String.format("An exception occurred while retrieving users from user provider: %s", e.getMessage()));
            log.debug("Stacktrace", e);
            throw e;
        }
    }

    /**
     * Returns information about a user given its id
     * @param id
     * @return
     * @throws IOException
     */
    public Optional<KeycloakUser> getUserById(String id) throws IOException {
        return getUsers().stream()
                .filter(keycloakUser -> keycloakUser.getId().equals(id))
                .findFirst();
    }

}
