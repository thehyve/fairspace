package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.beans.BeanPersister;
import io.fairspace.saturn.rdf.beans.PersistentEntity;
import io.fairspace.saturn.rdf.beans.RDFProperty;
import io.fairspace.saturn.rdf.beans.RDFType;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

import static io.fairspace.saturn.rdf.TransactionUtils.commit;

public class UserService {
    private static final String ANONYMOUS = "http://fairspace.io/iri/test-user";
    private final RDFConnection rdf;
    private final BeanPersister persister;
    private final Map<String, User> usersById = new ConcurrentHashMap<>();

    public UserService(RDFConnection rdf) {
        this.rdf = rdf;
        this.persister = new BeanPersister(rdf);

        loadUsers();
    }

    private void loadUsers() {
        persister.list(User.class).forEach(user -> usersById.put(user.getExternalId(), user));
    }

    /**
     * Returns a URI for the provided userInfo.
     * First tries to find an exiting fs:User entity which externalId  equals to userInfo.getUserId()
     * If no existing entry is found, creates a new one and stores userInfo in it.
     * Also updates an existing one if one of the userInfo's fileds changed.
     * @param userInfo
     * @return
     */
    public String getUserIRI(UserInfo userInfo) {
        if (userInfo == null) {
            return ANONYMOUS;
        }

        var user = usersById.get(userInfo.getUserId());
        if (user != null) {
            if (!Objects.equals(user.getName(), userInfo.getFullName()) || !Objects.equals(user.getEmail(), userInfo.getEmail())) {
                user.setName(userInfo.getFullName());
                user.setEmail(userInfo.getEmail());
                commit("Update user info, id: " + userInfo.getUserId(), rdf, () -> persister.write(user));
            }
            return user.getIri().getURI();
        } else {
            var newUser = new User();
            newUser.setExternalId(userInfo.getUserId());
            newUser.setName(userInfo.getFullName());
            newUser.setEmail(userInfo.getEmail());
            commit("Store a new user, id: " + userInfo.getUserId(), rdf, () -> {
                persister.write(newUser);
                usersById.put(newUser.getExternalId(), newUser);
            });
            return newUser.getIri().getURI();
        }
    }

    @RDFType("http://fairspace.io/ontology#User")
    @EqualsAndHashCode(callSuper = true)
    @Data
    private static class User extends PersistentEntity {
        @RDFProperty("http://fairspace.io/ontology#externalId")
        private String externalId;

        @RDFProperty("http://www.w3.org/2000/01/rdf-schema#label")
        private String name;

        @RDFProperty("http://fairspace.io/ontology#email")
        private String email;
    }
}
