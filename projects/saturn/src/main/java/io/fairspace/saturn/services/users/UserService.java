package io.fairspace.saturn.services.users;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.eclipse.jetty.client.HttpClient;
import org.eclipse.jetty.util.ssl.SslContextFactory;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.rdf.transactions.Transactions.calculateWrite;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.util.EnumSet.allOf;
import static java.util.stream.Collectors.toList;
import static org.apache.http.HttpStatus.SC_OK;
import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

@Slf4j
public class UserService {
    private static final ObjectMapper mapper = new ObjectMapper().configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final HttpClient httpClient = new HttpClient(new SslContextFactory(true));


    private final DAO dao;
    private final String usersUrl;

    public UserService(Dataset dataset, String usersUrl) {
        this.dao = new DAO(dataset);
        this.usersUrl = usersUrl;
    }

    public User trySetCurrentUser(User user) {
        if (user.isAdmin()) {
            user.getRoles().addAll(allOf(Role.class));
            return user;
        }

        return dao.read(User.class, user.getIri());
    }

    public Set<User> getUsers() {
        var result = new HashSet<>(dao.list(User.class));

        try {
            result.addAll(fetchKeycloakUsers());
        } catch (Exception e) {
            log.error("Error retrieving users from {}", usersUrl, e);
        }

        return result;
    }

    private List<User> fetchKeycloakUsers() throws Exception {
        if (usersUrl == null) {
            return List.of();
        }

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
            List<KeycloakUser> keycloakUsers = mapper.readValue(response.getContent(), new TypeReference<List<KeycloakUser>>() {});
            log.trace("Retrieved {} users from keycloak", keycloakUsers.size());
            return keycloakUsers
                    .stream()
                    .filter(KeycloakUser::isEnabled)
                    .map(keycloakUser -> {
                        var user = new User();
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

    public User getUser(Node iri) {
        return dao.read(User.class, iri);
    }

    public User addUser(User user) {
        return calculateWrite("Add a user " + user.getIri(), dao.getDataset(), () -> {
            validate(getThreadContext().getUser().getRoles().contains(Role.Coordinator), "The managing user must have Coordinator's role.");
            validate(user.getIri() != null, "Please provide a valid IRI.");

            return dao.write(user);
        });
    }
}
