package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.dao.DAO;
import org.apache.jena.graph.Node;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;

public class UserService {
    private final Supplier<UserInfo> currentUserInfoSupplier;
    private final DAO dao;
    private final Map<Node, User> usersById = new ConcurrentHashMap<>();

    public UserService(Supplier<UserInfo> currentUserInfoSupplier, DAO dao) {
        this.currentUserInfoSupplier = currentUserInfoSupplier;
        this.dao = dao;

        loadUsers();
    }

    private void loadUsers() {
        dao.list(User.class).forEach(user -> usersById.put(user.getIri(), user));
    }

    /**
     * Returns a URI for the provided userInfo.
     * First tries to find an exiting fs:User entity which externalId  equals to userInfo.getUserId()
     * If no existing entry is found, creates a new one and stores userInfo in it.
     * Also updates an existing one if one of the userInfo's fields changed.

     * @param userInfo
     * @return
     */
    public Node getUserIRI(UserInfo userInfo) {
        return getOrCreateUser(userInfo).getIri();
    }

    public User getCurrentUser() {
        return getOrCreateUser(currentUserInfoSupplier.get());
    }

    public User getUser(Node iri) {
        return usersById.values()
                .stream()
                .filter(user -> user.getIri().equals(iri))
                .findFirst()
                .orElse(null);
    }

    private User getOrCreateUser(UserInfo userInfo) {
        var user = findUser(userInfo);
        if (user != null) {
            if (!Objects.equals(user.getName(), userInfo.getFullName()) || !Objects.equals(user.getEmail(), userInfo.getEmail())) {
                updateUser(user, userInfo);
            }
            return user;
        } else {
            return createUser(userInfo);
        }
    }

    private User findUser(UserInfo userInfo) {
        return usersById.get(generateMetadataIri(userInfo.getUserId()));
    }

    private User createUser(UserInfo userInfo) {
        var newUser = new User();
        newUser.setIri(generateMetadataIri(userInfo.getUserId()));
        newUser.setName(userInfo.getFullName());
        newUser.setEmail(userInfo.getEmail());
        return commit("Store a new user with id " + userInfo.getUserId(), dao, () -> {
            var createdInMeantime = findUser(userInfo);
            if(createdInMeantime != null) {
                return createdInMeantime;
            }
            dao.write(newUser);
            usersById.put(newUser.getIri(), newUser);
            return newUser;
        });
    }

    private void updateUser(User user, UserInfo userInfo) {
        user.setName(userInfo.getFullName());
        user.setEmail(userInfo.getEmail());
        commit("Update user with id " + userInfo.getUserId(), dao, () -> dao.write(user));
    }
}
