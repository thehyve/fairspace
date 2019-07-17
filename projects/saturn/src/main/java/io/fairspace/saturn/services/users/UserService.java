package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static io.fairspace.saturn.auth.SecurityUtil.authorizationHeader;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static java.lang.System.currentTimeMillis;
import static java.util.concurrent.Executors.newSingleThreadExecutor;
import static java.util.stream.Collectors.toList;
import static org.apache.http.HttpStatus.SC_OK;
import static org.eclipse.jetty.http.HttpHeader.AUTHORIZATION;

@Slf4j
public class UserService {
    private static final ObjectMapper mapper = new ObjectMapper().configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final ExecutorService executor = newSingleThreadExecutor();

    private final String usersEndpoint;
    private final DAO dao;
    private final Map<Node, User> usersByIri = new ConcurrentHashMap<>();
    private final HttpClient httpClient = new HttpClient(new SslContextFactory(true));
    private final boolean authorizationRequired;
    private final long refreshInterval;
    private volatile long lastRefreshTime;

    public UserService(String usersEndpoint, long refreshInterval, DAO dao, boolean authorizationRequired) {
        this.usersEndpoint = usersEndpoint;
        this.dao = dao;
        this.authorizationRequired = authorizationRequired;
        this.refreshInterval = refreshInterval;
    }

    public void onAuthorized(String userId) {
        getUser(getUserIri(userId));
    }

    public User getUser(Node iri) {
        var authorization = authorizationHeader();

        if (!usersByIri.containsKey(iri)) {
            refreshCacheNow(authorization); // Blocking
        } else if (isRefreshNeeded()) {
            refreshCacheAsync(authorization); // Schedules refreshing but returns immediately
        }

        return usersByIri.get(iri);
    }

    private boolean isRefreshNeeded() {
        return currentTimeMillis() - lastRefreshTime > refreshInterval;
    }

    private void refreshCacheNow(String authorization) {
        if (authorizationRequired && authorization == null) {
            return;
        }
        var users = fetchUsers(authorization);
        var updated = users
                .stream()
                .filter(user -> !user.equals(usersByIri.put(user.getIri(), user)))
                .collect(toList());
        if (!updated.isEmpty()) {
            commit("Update user information", dao, () -> updated.forEach(dao::write));
        }
        lastRefreshTime = currentTimeMillis();
    }

    private void refreshCacheAsync(String authorization) {
        executor.submit(() -> {
            if (isRefreshNeeded()) { // still needed?
                refreshCacheNow(authorization);
            }
        });
    }

    private List<User> fetchUsers(String authorization) {
        try {
            if (!httpClient.isStarted()) {
                httpClient.start();
            }
            var request = httpClient.newRequest(usersEndpoint);
            if(authorization != null) {
                request.header(AUTHORIZATION, authorization);
            }
            var response = request.send();
            if (response.getStatus() == SC_OK) {
                List<KeycloakUser> keycloakUsers = mapper.readValue(response.getContent(), new TypeReference<List<KeycloakUser>>() {});
                return keycloakUsers
                        .stream()
                        .map(keycloakUser -> {
                            var user = new User();
                            user.setIri(getUserIri(keycloakUser.getId()));
                            user.setName(keycloakUser.getFullName());
                            user.setEmail(keycloakUser.getEmail());
                            return user;
                        })
                        .collect(toList());
            } else {
                log.error("Error retrieving users from {}: {} {}", usersEndpoint, response.getStatus(), response.getReason());
            }
        } catch (Exception e) {
            log.error("Error retrieving users from {}", usersEndpoint, e);
        }
        return List.of();
    }

    public Node getUserIri(String userId) {
        return generateMetadataIri(userId);
    }
}
