package io.fairspace.saturn.services.users;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.dao.PersistentEntity;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UsersResource;

import javax.servlet.ServletException;
import javax.ws.rs.NotFoundException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static java.lang.System.getenv;
import static java.util.stream.Collectors.toMap;
import static org.apache.commons.lang3.StringUtils.isNotEmpty;

@Slf4j
public class UserService {
    private final LoadingCache<Boolean, Map<Node, User>> usersCache;
    private final Transactions transactions;
    private final Config.Auth config;
    private final UsersResource usersResource;


    public UserService(Config.Auth config, Transactions transactions) {
        this.config = config;
        this.transactions = transactions;

        this.usersResource = KeycloakBuilder.builder()
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

        usersCache = CacheBuilder.newBuilder()
                .refreshAfterWrite(30, TimeUnit.SECONDS)
                .build(new CacheLoader<>() {
                    @Override
                    public Map<Node, User> load(Boolean key) {
                        return fetchUsers();
                    }
                });
    }

    public Collection<User> getUsers() {
        return getUsersMap().values();
    }

    public User currentUser() {
        return getUsersMap().get(getUserURI());
    }

    public Map<Node, User> getUsersMap() {
        try {
            return usersCache.get(Boolean.FALSE);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    private Map<Node, User> fetchUsers() {
        var keycloakUsers = usersResource.list();
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

                            if (config.superAdminUser.equals(ku.getUsername())) {
                                user.setSuperadmin(true);
                                user.setAdmin(true);
                                user.setCanViewPublicMetadata(true);
                                user.setCanViewPublicData(true);
                            }

                            updated.add(user);
                        }

                        var name = (isNotEmpty(ku.getFirstName()) || isNotEmpty(ku.getLastName()))
                                ? (ku.getFirstName() + " " + ku.getLastName()).trim()
                                : ku.getUsername();

                        if (!Objects.equals(user.getName(), name)
                                || !Objects.equals(user.getEmail(), ku.getEmail())
                                || !Objects.equals(user.getUsername(), ku.getUsername())) {
                            user.setEmail(ku.getEmail());
                            user.setName(name);
                            user.setUsername(ku.getUsername());
                            updated.add(user);
                        }

                        return user;
                    }).collect(toMap(PersistentEntity::getIri, u -> u));
        });

        if (!updated.isEmpty()) {
            transactions.executeWrite(model -> {
                var dao = new DAO(model);
                updated.forEach(dao::write);
            });
        }

        return users;
    }

    public void logoutCurrent() {
        try {
            getCurrentRequest().logout();
        } catch (ServletException e) {
            throw new RuntimeException(e);
        }
    }

    public void update(UserRolesUpdate roles) {
        if (!currentUser().isAdmin()) {
            throw new AccessDeniedException();
        }
        transactions.executeWrite(model -> {
            var dao = new DAO(model);
            var user = dao.read(User.class, generateMetadataIri(roles.getId()));
            if (user == null) {
                throw new NotFoundException();
            }
            if (user.isSuperadmin()) {
                throw new IllegalArgumentException("Cannot modify superadmin's roles");
            }
            if (roles.getAdmin() != null) {
                user.setAdmin(roles.getAdmin());
                if (user.isAdmin()) {
                    user.setCanViewPublicData(true);
                    user.setCanViewPublicMetadata(true);
                }
            }
            if (roles.getCanViewPublicData() != null) {
                user.setCanViewPublicData(roles.getCanViewPublicData());
                if (user.isCanViewPublicData()) {
                    user.setCanViewPublicMetadata(true);
                }
            }
            if (roles.getCanViewPublicMetadata() != null) {
                user.setCanViewPublicMetadata(roles.getCanViewPublicMetadata());
            }
            if (roles.getCanAddSharedMetadata() != null) {
                user.setCanAddSharedMetadata(roles.getCanAddSharedMetadata());
            }

            if (user.isAdmin() && !user.isCanViewPublicData()
            || user.isCanViewPublicData() && !user.isCanViewPublicMetadata()) {
                throw new IllegalArgumentException("Inconsistent organisation-level roles");
            }

            dao.write(user);
        });

        usersCache.invalidateAll();
    }
}
