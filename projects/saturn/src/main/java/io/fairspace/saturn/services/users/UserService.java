package io.fairspace.saturn.services.users;

import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;

import java.util.List;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.rdf.transactions.Transactions.calculateWrite;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.util.EnumSet.allOf;

@Slf4j
public class UserService {
    private final DAO dao;

    public UserService(Dataset dataset) {
        this.dao = new DAO(dataset);
    }

    public User trySetCurrentUser(User user) {
        var stored = dao.read(User.class, user.getIri());

        if (user.isAdmin()) {
            if (stored == null) {
                stored = dao.write(user);
            }
            stored.getRoles().addAll(allOf(Role.class));
        }

        return stored;
    }

    public List<User> getUsers() {
        return dao.list(User.class);
    }

    public User getUser(Node iri) {
        return dao.read(User.class, iri);
    }

    public User addUser(User user) {
        return calculateWrite("Add a user " + user.getIri(), dao.getDataset(), () -> {
            validate(getThreadContext().getUser().getRoles().contains(Role.Coordinator), "The managing user must have Coordinator's role.");
            validate(user.getIri() != null, "Please provide a valid IRI.");
            validate(dao.read(User.class, user.getIri()) == null, "A user with the provided IRI already exists.");

            return dao.write(user);
        });
    }

    public User updateUser(User user) {
        return calculateWrite("Update a user " + user.getIri(), dao.getDataset(), () -> {
            validate(getThreadContext().getUser().getRoles().contains(Role.Coordinator), "The managing user must have a Coordinator's role.");
            validate(user.getIri() != null, "Please provide a valid IRI.");
            validate(dao.read(User.class, user.getIri()) != null, "A user with the provided IRI doesn't exist.");

            return dao.write(user);
        });
    }
}
