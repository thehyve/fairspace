package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.rdf.dao.DAO;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static io.fairspace.saturn.ConfigLoader.CONFIG;
import static io.fairspace.saturn.auth.SecurityUtil.authorizationHeader;
import static io.fairspace.saturn.rdf.SparqlUtils.extractIdFromIri;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static java.lang.String.format;
import static org.apache.http.HttpStatus.SC_OK;
import static org.eclipse.jetty.http.HttpHeader.AUTHORIZATION;

@Slf4j
public class UserService {
    private static final ObjectMapper mapper = new ObjectMapper().configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final String userUrlTemplate;
    private DAO dao;
    private final HttpClient httpClient = new HttpClient(new SslContextFactory(true));

    public UserService(String userUrlTemplate, DAO dao) {
        this.userUrlTemplate = userUrlTemplate;
        this.dao = dao;
    }

    public List<User> getUsers() {
        return dao.list(User.class);
    }

    public User getUser(Node iri) {
        User localUser = dao.read(User.class, iri);

        if (localUser == null) {
            // Fetch user from keycloak and store locally for future reference
            localUser = fetchUserFromKeycloak(iri);

            if(localUser != null) {
                dao.write(localUser);
            }
        }

        return localUser;
    }

    private User fetchUserFromKeycloak(Node iri) {
        var userId = getUserId(iri);
        var authorization = authorizationHeader();

        var url = format(userUrlTemplate, userId);
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
                KeycloakUser keycloakUser = mapper.readValue(response.getContent(), KeycloakUser.class);
                log.trace("Retrieved user from keycloak");

                var user = new User();
                user.setIri(getUserIri(keycloakUser.getId()));
                user.setName(keycloakUser.getFullName());
                user.setEmail(keycloakUser.getEmail());
                return user;
            } else {
                log.error("Error retrieving user from {}: {} {}", url, response.getStatus(), response.getReason());
            }
        } catch (Exception e) {
            log.error("Error retrieving user from {}", url, e);
        }

        return null;
    }

    public Node getUserIri(String userId) {
        return generateMetadataIri(userId);
    }

    public String getUserId(Node iri) {
        return extractIdFromIri(iri);
    }
}
