package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static java.util.stream.Collectors.toList;
import static org.apache.http.HttpStatus.SC_OK;
import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

@Slf4j
public class UserService {
    private static final ObjectMapper mapper = new ObjectMapper().configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final HttpClient httpClient = new HttpClient(new SslContextFactory(true));
    private final String usersUrl;
    private final LoadingCache<Boolean, List<User>> users;

    public UserService(DAO dao, String usersUrl) {
        this.usersUrl = usersUrl;
        users = CacheBuilder.newBuilder()
                .expireAfterAccess(30, TimeUnit.SECONDS)
                .build(new CacheLoader<>() {
                    @Override
                    public List<User> load(Boolean key) throws Exception {
                        var users = fetchKeycloakUsers();
                        dao.getDataset().executeWrite(() -> users.forEach(dao::write));
                        return users;
                    }
                });
    }

    public User getUser(Node iri) {
        return getUsers().stream().filter(u -> u.getIri().equals(iri)).findFirst().orElse(null);
    }

    public List<User> getUsers() {
        try {
            return users.get(false);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private List<User> fetchKeycloakUsers() throws Exception {
        if (!httpClient.isStarted()) {
            httpClient.start();
        }

        var request = httpClient.newRequest(usersUrl);

        var authorization = getCurrentConnection().getHttpChannel().getRequest().getHeader("Authorization");
        if (authorization != null) {
            request.header("Authorization", authorization);
        }

        var response = request.send();
        if (response.getStatus() == SC_OK) {
            List<KeycloakUser> keycloakUsers = mapper.readValue(response.getContent(), new TypeReference<>() {});
            log.trace("Retrieved {} users from keycloak", keycloakUsers.size());
            return keycloakUsers
                    .stream()
                    .filter(KeycloakUser::isEnabled)
                    .map(keycloakUser -> {
                        var user = new User();
                        user.setId(keycloakUser.getId());
                        user.setIri(generateMetadataIri(keycloakUser.getId()));
                        user.setName(keycloakUser.getFullName());
                        user.setEmail(keycloakUser.getEmail());
                        return user;
                    })
                    .collect(toList());
        } else {
            throw new IOException("Error retrieving users " + response.getStatus() + " " + response.getReason());
        }
    }
}
