package io.fairspace.neptune.service;

import io.fairspace.neptune.model.KeycloakUser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
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
    public UsersService(RestTemplate authorizedRestTemplate,
                        @Value("${app.oauth2.base-url}/auth/admin/realms/${app.oauth2.realm}/users") String usersEndpoint
    ) {
        this.restTemplate = authorizedRestTemplate;
        this.usersEndpoint = usersEndpoint;
    }

    /**
     * Returns information about a user given its id
     * @param id
     * @return
     * @throws IOException
     */
    @Cacheable("users")
    public Optional<KeycloakUser> getUserById(String id) throws IOException {
        if(id == null) {
            return Optional.empty();
        }

        try {
            log.info("Retrieving user information by id: {}", id);
            return Optional.of(restTemplate.exchange(
                    usersEndpoint + "/" + id,
                    HttpMethod.GET,
                    null,
                    KeycloakUser.class
            ).getBody());
        } catch(HttpClientErrorException e) {
            log.info("No user found for id {}", id);
            log.debug("Stacktrace", e);
            return Optional.empty();
        } catch (Exception e) {
            log.error("An exception occurred while retrieving user from user provider: {}", e.getMessage());
            log.debug("Stacktrace", e);
            throw e;
        }
    }

}
