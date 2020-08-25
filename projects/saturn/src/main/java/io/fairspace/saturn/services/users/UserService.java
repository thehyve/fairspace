package io.fairspace.saturn.services.users;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.UserRepresentation;

import javax.servlet.ServletException;
import javax.ws.rs.NotFoundException;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static java.lang.System.getenv;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.lang3.StringUtils.isNotEmpty;

@Slf4j
public class UserService {
    private final LoadingCache<Boolean, List<UserRepresentation>> keycloakUsersCache;
    private final Transactions transactions;
    private final Config.Auth config;


    public UserService(Config.Auth config, Transactions transactions) {
        this.config = config;
        this.transactions = transactions;

        var usersResource = KeycloakBuilder.builder()
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

        keycloakUsersCache = CacheBuilder.newBuilder()
                .expireAfterAccess(30, TimeUnit.SECONDS)
                .build(new CacheLoader<>() {
                    @Override
                    public List<UserRepresentation> load(Boolean key) {
                        return usersResource.list();
                    }
                });
    }

    private List<UserRepresentation> getKeycloakUsers() throws ExecutionException {
        return keycloakUsersCache.get(Boolean.FALSE);
    }

    public User currentUser() {
        var iri = getUserURI();
        var user = getUsers().stream().filter(u -> u.getIri().equals(iri)).findFirst().orElse(null);
        return user;
    }

    public List<User> getUsers() {
        try {
            var keycloakUsers = getKeycloakUsers();
            var updated = new HashSet<User>();
            var users = transactions.calculateRead(model -> {
                var dao = new DAO(model);
                return keycloakUsers.stream()
                .map(ku -> {
                    var iri = generateMetadataIri(ku.getId());
                    var user = dao.read(User.class, iri);
                    if (user == null) {
                        user = new User();
                        user.setIri(iri);
                        user.setId(ku.getId());

                        updated.add(user);
                    }

                    var name = (isNotEmpty(ku.getFirstName()) || isNotEmpty(ku.getLastName()))
                            ? (ku.getFirstName() + " " + ku.getLastName()).trim()
                            : ku.getUsername();

                    if (!Objects.equals(user.getName(), name) || !Objects.equals(user.getEmail(), ku.getEmail())) {
                        user.setEmail(ku.getEmail());
                        user.setName(name);
                        updated.add(user);
                    }

                    user.setSuperadmin(config.superAdminUser.equals(ku.getUsername()));

                    return user;
                }).collect(toList());
            });

            if (!updated.isEmpty()) {
                transactions.executeWrite(model -> {
                    var dao = new DAO(model);
                    updated.forEach(dao::write);
                });
            }

            return users;
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

    public void update(UserRolesUpdate roles) {
        if (!currentUser().isAdmin() && !currentUser().isSuperadmin()) {
            throw new AccessDeniedException();
        }
        transactions.executeWrite(model -> {
            var dao = new DAO(model);
            var user = dao.read(User.class, generateMetadataIri(roles.getId()));
            if (user == null) {
                throw new NotFoundException();
            }
            if (roles.getAdmin() != null) {
                user.setAdmin(roles.getAdmin());
            }
            if (roles.getViewPublicMetadata() != null) {
                user.setViewPublicMetadata(roles.getViewPublicMetadata());
            }
            if (roles.getViewPublicData() != null) {
                user.setViewPublicData(roles.getViewPublicData());
            }
            if (roles.getAddSharedMetadata() != null) {
                user.setAddSharedMetadata(roles.getAddSharedMetadata());
            }
            dao.write(user);
        });
    }
}
