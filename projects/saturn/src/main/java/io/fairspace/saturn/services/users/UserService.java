package io.fairspace.saturn.services.users;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.Transactions;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UsersResource;

import javax.servlet.ServletException;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static java.lang.System.getenv;
import static org.apache.commons.lang3.StringUtils.isNotEmpty;

@Slf4j
public class UserService {
    private final LoadingCache<Boolean, List<User>> users;
    private final UsersResource usersResource;


    public UserService(Config.Auth config, Transactions transactions) {
        usersResource = KeycloakBuilder.builder()
                .serverUrl(config.authServerUrl)
                .realm(config.realm)
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .clientId(config.clientId)
                .clientSecret(getenv("KEYCLOAK_CLIENT_SECRET"))
                .username(config.clientId)
                .password(getenv("KEYCLOAK_CLIENT_SECRET"))
                .build()
                .realm(config.realm)
                .users();

        users = CacheBuilder.newBuilder()
                .expireAfterAccess(30, TimeUnit.SECONDS)
                .build(new CacheLoader<>() {
                    @Override
                    public List<User> load(Boolean key) {
                        var users = fetchKeycloakUsers();
                        transactions.executeWrite(ds -> users.forEach(new DAO(ds)::write));
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

    public void logoutCurrent() {
        try {
            getCurrentRequest().logout();
        } catch (ServletException e) {
            throw new RuntimeException(e);
        }
    }

    private List<User> fetchKeycloakUsers() {
        return usersResource.list()
                .stream()
                .map(keycloakUser -> {
                    var user = new User();
                    var name = (isNotEmpty(keycloakUser.getFirstName()) || isNotEmpty(keycloakUser.getLastName()))
                            ? (keycloakUser.getFirstName() + " " + keycloakUser.getLastName()).trim()
                            : keycloakUser.getUsername();
                    user.setId(keycloakUser.getId());
                    user.setIri(generateMetadataIri(keycloakUser.getId()));
                    user.setName(name);
                    user.setEmail(keycloakUser.getEmail());
                    return user;
                })
                .collect(Collectors.toList());
    }
}
