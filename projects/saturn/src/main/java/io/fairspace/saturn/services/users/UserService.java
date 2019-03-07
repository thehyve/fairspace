package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.dao.DAO;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

import static io.fairspace.saturn.rdf.TransactionUtils.commit;

public class UserService {
    private final DAO dao;
    private final Map<String, User> usersById = new ConcurrentHashMap<>();

    public UserService(RDFConnection rdf) {
        this.dao = new DAO(rdf, () -> null);

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
    public String getUserIRI(UserInfo userInfo) {
        return  getUser(userInfo).getIri().getURI();
    }

    private User getUser(UserInfo userInfo) {
        var user = usersById.get(userInfo.getUserId());
        if (user != null) {
            if (!Objects.equals(user.getName(), userInfo.getFullName()) || !Objects.equals(user.getEmail(), userInfo.getEmail())) {
                user.setName(userInfo.getFullName());
                user.setEmail(userInfo.getEmail());
                commit("Update user with id " + userInfo.getUserId(), dao.transactional(), () -> dao.write(user));
            }
            return user;
        } else {
            var newUser = new User();
            newUser.setExternalId(userInfo.getUserId());
            newUser.setName(userInfo.getFullName());
            newUser.setEmail(userInfo.getEmail());
            return commit("Store a new user with id " + userInfo.getUserId(), dao.transactional(), () -> {
                var createdInMeantime = usersById.get(userInfo.getUserId());
                if(createdInMeantime != null) {
                    return createdInMeantime;
                }
                dao.write(newUser);
                usersById.put(newUser.getExternalId(), newUser);
                return newUser;
            });
        }
    }
}
