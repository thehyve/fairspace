package io.fairspace.saturn.services.users;

import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import jakarta.ws.rs.NotFoundException;
import lombok.extern.log4j.*;
import org.apache.commons.lang3.*;
import org.apache.jena.graph.Node;
import org.apache.jena.sparql.util.Symbol;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UsersResource;

import io.fairspace.saturn.auth.RequestContext;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.dao.PersistentEntity;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;

import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;

import static java.lang.System.getenv;
import static java.util.stream.Collectors.toMap;

@Log4j2
public class UserService {
    private final LoadingCache<Boolean, Map<Node, User>> usersCache;
    private final Transactions transactions;
    private final Config.Auth config;
    private final UsersResource usersResource;
    private final ExecutorService threadpool = Executors.newSingleThreadExecutor();

    public UserService(Config.Auth config, Transactions transactions, UsersResource usersResource) {
        this.config = config;
        this.transactions = transactions;
        this.usersResource = usersResource;
        usersCache = CacheBuilder.newBuilder()
                .refreshAfterWrite(30, TimeUnit.SECONDS)
                .build(new CacheLoader<>() {
                    @Override
                    public Map<Node, User> load(Boolean key) {
                        return fetchUsers();
                    }
                });
    }

    public UserService(Config.Auth config, Transactions transactions) {
        this(
                config,
                transactions,
                KeycloakBuilder.builder()
                        .serverUrl(config.authServerUrl)
                        .realm(config.realm)
                        .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                        .clientId(config.clientId)
                        .clientSecret(getenv("KEYCLOAK_CLIENT_SECRET"))
                        .username(config.clientId)
                        .password(getenv("KEYCLOAK_CLIENT_SECRET"))
                        .build()
                        .realm(config.realm)
                        .users());
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

    public static Symbol currentUserAsSymbol() {
        var uri = RequestContext.getCurrentUserStringUri().orElse("anonymous");
        return Symbol.create(uri);
    }

    private Map<Node, User> fetchUsers() {
        var userCount = usersResource.count();
        var keycloakUsers = usersResource.list(0, userCount);
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

                            if (config.superAdminUser.equalsIgnoreCase(ku.getUsername())) {
                                user.setSuperadmin(true);
                                user.setAdmin(true);
                                user.setCanViewPublicMetadata(true);
                                user.setCanViewPublicData(true);
                            }

                            for (var role : config.defaultUserRoles) {
                                switch (role) {
                                    case "admin" -> user.setAdmin(true);
                                    case "canViewPublicMetadata" -> user.setCanViewPublicMetadata(true);
                                    case "canViewPublicData" -> user.setCanViewPublicData(true);
                                    case "canAddSharedMetadata" -> user.setCanAddSharedMetadata(true);
                                    case "canQueryMetadata" -> user.setCanQueryMetadata(true);
                                }
                            }

                            updated.add(user);
                        }

                        var name = Stream.of(ku.getFirstName(), ku.getLastName())
                                .filter(StringUtils::isNotEmpty)
                                .map(String::trim)
                                .collect(Collectors.joining(" "));
                        if (name.isEmpty()) {
                            name = ku.getUsername();
                        }

                        if (!Objects.equals(user.getName(), name)
                                || !Objects.equals(user.getEmail(), ku.getEmail())
                                || !Objects.equals(user.getUsername(), ku.getUsername())) {
                            user.setEmail(ku.getEmail());
                            user.setName(name);
                            user.setUsername(ku.getUsername());
                            updated.add(user);
                        }

                        return user;
                    })
                    .collect(toMap(PersistentEntity::getIri, u -> u));
        });

        if (!updated.isEmpty()) {
            threadpool.submit(() -> {
                log.info("Updating users asynchronously");
                transactions.executeWrite(model -> {
                    var dao = new DAO(model);
                    updated.forEach(dao::write);
                });
            });
        }
        return users;
    }

    // todo: implement logout
    public void logoutCurrent() {
        //        try {
        //            getCurrentRequest().logout();
        //        } catch (ServletException e) {
        //            throw new RuntimeException(e);
        //        }
    }

    public void update(UserRolesUpdate roles) {
        if (!currentUser().isAdmin()) {
            throw new AccessDeniedException();
        }
        final String[] username = new String[1];
        transactions.executeWrite(model -> {
            var dao = new DAO(model);
            var user = dao.read(User.class, generateMetadataIri(roles.getId()));
            if (user == null) {
                throw new NotFoundException();
            }
            if (user.isSuperadmin()) {
                if (Stream.of(roles.getAdmin(), roles.getCanViewPublicData(), roles.getCanViewPublicMetadata())
                        .anyMatch(role -> role != null && !role)) {
                    throw new IllegalArgumentException(
                            "Cannot revoke admin or public access roles from superadmin user.");
                }
            }
            username[0] = user.getUsername();
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
            if (roles.getCanQueryMetadata() != null) {
                user.setCanQueryMetadata(roles.getCanQueryMetadata());
                if (user.isCanQueryMetadata()) {
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
                    || user.isCanViewPublicData() && !user.isCanViewPublicMetadata()
                    || user.isCanQueryMetadata() && !user.isCanViewPublicMetadata()) {
                throw new IllegalArgumentException("Inconsistent organisation-level roles");
            }

            dao.write(user);
        });
        audit("USER_UPDATE", "affected_user", username[0]);
        usersCache.invalidateAll();
    }
}
