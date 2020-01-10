package io.fairspace.saturn.services.users;

import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;

import java.util.List;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.rdf.SparqlUtils.extractIdFromIri;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.rdf.transactions.Transactions.calculateWrite;
import static io.fairspace.saturn.util.ValidationUtils.validate;

@Slf4j
public class UserService {
    private final DAO dao;
    private final String coordinatorsRole;

    public UserService(Dataset dataset, String coordinatorsRole) {
        this.coordinatorsRole = coordinatorsRole;
        this.dao = new DAO(dataset, () -> getUserIri(getThreadContext().getUserInfo().getSubjectClaim()));
    }

    public List<User> getUsers() {
        getCurrentUser(); // implicitly ads the current user if missing
        return dao.list(User.class);
    }

    public Node getCurrentUserIri() {
        return getUserIri(getThreadContext().getUserInfo().getSubjectClaim());
    }

    public User getCurrentUser() {
        var userInfo = getThreadContext().getUserInfo();
        var user = getUser(getUserIri(userInfo.getSubjectClaim()));
        if (user == null) {
            // Must be a coordinator
            if (userInfo.getAuthorities().contains(coordinatorsRole)) {
                var u = new User();
                u.setIri(getUserIri(userInfo.getSubjectClaim()));
                u.setEmail(userInfo.getEmail());
                u.setName(userInfo.getFullName());
                u.getRoles().add(Role.CanRead);
                u.getRoles().add(Role.Coordinator);

                user = calculateWrite("Add a coordinator", dao.getDataset(), () -> dao.write(u));
            }
        }
        return user;
    }

    public User getUser(Node iri) {
        return dao.read(User.class, iri);
    }

    public User addUser(User user) {
        return calculateWrite("Add a user " + user.getIri(), dao.getDataset(), () -> {
            validate(getCurrentUser().getRoles().contains(Role.Coordinator), "The managing user must have Coordinator's role.");
            validate(user.getIri() != null, "Please provide a valid IRI.");
            validate(dao.read(User.class, user.getIri()) == null, "A user with the provided IRI already exists.");

            return dao.write(user);
        });
    }

    public User updateUser(User user) {
        return calculateWrite("Update a user " + user.getIri(), dao.getDataset(), () -> {
            validate(getCurrentUser().getRoles().contains(Role.Coordinator), "The managing user must have a Coordinator's role.");
            validate(user.getIri() != null, "Please provide a valid IRI.");
            validate(dao.read(User.class, user.getIri()) != null, "A user with the provided IRI doesn't exist.");

            return dao.write(user);
        });
    }

    public Node getUserIri(String userId) {
        return generateMetadataIri(userId);
    }

    public String getUserId(Node iri) {
        return extractIdFromIri(iri);
    }
}
