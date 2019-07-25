package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static io.fairspace.saturn.auth.SecurityUtil.authorizationHeader;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static java.lang.String.format;
import static java.lang.System.currentTimeMillis;
import static java.util.concurrent.Executors.newSingleThreadExecutor;
import static java.util.stream.Collectors.toList;
import static org.apache.http.HttpStatus.SC_OK;
import static org.eclipse.jetty.http.HttpHeader.AUTHORIZATION;

@Slf4j
public class UserService {
    private static final ObjectMapper mapper = new ObjectMapper().configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final ExecutorService executor = newSingleThreadExecutor();
    private final String groupsEndpoint;
    private final String workspaceLoginGroup;
    private final String usersUrlTemplate;
    private final DAO dao;
    private final Map<Node, User> usersByIri = new ConcurrentHashMap<>();
    private final HttpClient httpClient = new HttpClient(new SslContextFactory(true));
    private final long userListRefreshInterval;
    private volatile long lastRefreshTime;
    private volatile String groupId;


    public UserService(String groupsEndpoint, String workspaceLoginGroup, String usersUrlTemplate, long userListRefreshInterval, DAO dao) {
        this.groupsEndpoint = groupsEndpoint;
        this.workspaceLoginGroup = workspaceLoginGroup;
        this.usersUrlTemplate = usersUrlTemplate;
        this.userListRefreshInterval = userListRefreshInterval;
        this.dao = dao;
    }

    public void onAuthorized(String userId) {
        refreshCacheAsync();
    }

    public User getUser(Node iri) {
        if (!usersByIri.containsKey(iri)) {
            refreshCacheNow(authorizationHeader());
        }

        return usersByIri.get(iri);
    }

    public List<User> getUsers() {
        if (usersByIri.isEmpty()) {
            refreshCacheNow(authorizationHeader());
        }

        return new ArrayList<>(usersByIri.values());
    }

    private boolean isRefreshNeeded() {
        return currentTimeMillis() - lastRefreshTime > userListRefreshInterval;
    }

    private void refreshCacheNow(String authorization) {
        log.debug("Refreshing user cache");
        var users = fetchUsers(authorization);
        var updated = users
                .stream()
                .filter(user -> !user.equals(usersByIri.put(user.getIri(), user)))
                .collect(toList());
        if (!updated.isEmpty()) {
            log.debug("Updating user cache with {} users", updated.size());
            commit("Update user information", dao, () -> updated.forEach(dao::write));
        }
        lastRefreshTime = currentTimeMillis();
    }

    private void refreshCacheAsync() {
        if (isRefreshNeeded()) {
            var authorization = authorizationHeader();
            executor.submit(() -> {
                if (isRefreshNeeded()) { // still needed?
                    refreshCacheNow(authorization);
                }
            });
        }
    }

    private List<User> fetchUsers(String authorization) {
        var url = format(usersUrlTemplate, getGroupId());
        try {
            if (!httpClient.isStarted()) {
                httpClient.start();
            }
            var request = httpClient.newRequest(url);
            if (authorization != null) {
                request.header(AUTHORIZATION, authorization);
            }
            var response = request.send();
            if (response.getStatus() == SC_OK) {
                List<KeycloakUser> keycloakUsers = mapper.readValue(response.getContent(), new TypeReference<List<KeycloakUser>>() {
                });
                log.trace("Retrieved {} users from keycloak", keycloakUsers.size());
                return keycloakUsers
                        .stream()
                        .filter(KeycloakUser::isEnabled)
                        .map(keycloakUser -> {
                            var user = new User();
                            user.setIri(getUserIri(keycloakUser.getId()));
                            user.setName(keycloakUser.getFullName());
                            user.setEmail(keycloakUser.getEmail());
                            return user;
                        })
                        .collect(toList());
            } else {
                log.error("Error retrieving users from {}: {} {}", url, response.getStatus(), response.getReason());
            }
        } catch (Exception e) {
            log.error("Error retrieving users from {}", url, e);
        }
        return List.of();
    }

    public Node getUserIri(String userId) {
        return generateMetadataIri(userId);
    }

    private String getGroupId() {
        // Retrieve the groupId, if it has not been retrieved before
        // As it will never change, we will cache it forever
        if (groupId == null) {
            try {
                //   log.info("Retrieve group identifier for keycloak user group at {}", config.getGroupUri());

                if (!httpClient.isStarted()) {
                    httpClient.start();
                }
                var request = httpClient.newRequest(groupsEndpoint);
                var response = request.send();
                if (response.getStatus() == SC_OK) {
                    List<KeycloakGroup> groups = mapper.readValue(response.getContent(), new TypeReference<List<KeycloakGroup>>() {
                    });
                    // Keycloak may return multiple groups, as there may be groups with similar names to the one
                    // being sought. For example, if we search for 'group-workspace', then it may return 'group-workspace2' as well
                    // For that reason we search the list to find the group with a matching name.
                    groupId = groups.stream()
                            .filter(groupInfo -> workspaceLoginGroup.equals(groupInfo.getName()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalStateException("None of the returned groups from keycloak matches the requested name"))
                            .getId();
                } else {
                    log.error("Could not retrieve group identifier from keycloak on url {}: status {}", groupsEndpoint, response.getStatus());
                }
            } catch (Exception e) {
                log.error("Error determining group id", e);
            }
        }

        return groupId;
    }

}
