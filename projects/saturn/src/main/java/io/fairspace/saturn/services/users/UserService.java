package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.dao.DAO;
import org.apache.jena.graph.Node;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

import static io.fairspace.saturn.rdf.TransactionUtils.commit;

public class UserService {
    private final DAO dao;
    private final Map<String, User> usersById = new ConcurrentHashMap<>();

    public UserService(DAO dao) {
        this.dao = dao;

        loadUsers();
    }

    private void loadUsers() {
        dao.list(User.class).forEach(user -> usersById.put(user.getExternalId(), user));
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
        return getUser(userInfo).getIri();
    }

    private User getUser(UserInfo userInfo) {
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
        return usersById.get(userInfo.getUserId());
    }

    private User createUser(UserInfo userInfo) {
        var newUser = new User();
        newUser.setExternalId(userInfo.getUserId());
        newUser.setName(userInfo.getFullName());
        newUser.setEmail(userInfo.getEmail());
        return commit("Store a new user with id " + userInfo.getUserId(), dao, () -> {
            var createdInMeantime = findUser(userInfo);
            if(createdInMeantime != null) {
                return createdInMeantime;
            }
            dao.write(newUser);
            usersById.put(newUser.getExternalId(), newUser);
            return newUser;
        });
    }

    private void updateUser(User user, UserInfo userInfo) {
        user.setName(userInfo.getFullName());
        user.setEmail(userInfo.getEmail());
        commit("Update user with id " + userInfo.getUserId(), dao, () -> dao.write(user));
    }
}
