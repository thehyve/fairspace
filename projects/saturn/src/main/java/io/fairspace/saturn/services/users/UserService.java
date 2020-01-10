package io.fairspace.saturn.services.users;

import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;

import java.util.List;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.rdf.transactions.Transactions.calculateWrite;
import static io.fairspace.saturn.util.ValidationUtils.validate;

@Slf4j
public class UserService {
    private final DAO dao;

    public UserService(Dataset dataset) {
        this.dao = new DAO(dataset);
    }

    public User trySetCurrentUser(User user) {
        var stored = dao.read(User.class, user.getIri());
        if (stored != null) {
            if (user.getRoles().contains(Role.Coordinator) && !stored.getRoles().contains(Role.Coordinator)) {
                stored.getRoles().add(Role.Coordinator);
                stored = dao.write(stored);
            } else if (!user.getRoles().contains(Role.Coordinator) && stored.getRoles().contains(Role.Coordinator)) {
                stored.getRoles().remove(Role.Coordinator);
                stored = dao.write(stored);
            }
        }  else if (user.getRoles().contains(Role.Coordinator)) {
            stored = dao.write(user);
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
