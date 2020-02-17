package io.fairspace.saturn.services.users;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.util.ValidationUtils.validate;

@Slf4j
public class UserService {
    private final DAO dao;

    public UserService(DatasetJobSupport dataset) {
        this.dao = new DAO(dataset);
    }

    public User getUser(Node iri) {
        return dao.read(User.class, iri);
    }

    public User addUser(User user) {
        var result = dao.getDataset().calculateWrite(() -> {
            validate(getThreadContext().getUser().getRoles().contains(Role.Coordinator), "The managing user must have Coordinator's role.");
            validate(user.getIri() != null, "Please provide a valid IRI.");

            return dao.write(user);
        });


        audit("USER_ADD",
                "iri", user.getIri().getURI(),
                "name", user.getName(),
                "email", user.getEmail(),
                "roles", user.getRoles().toString());

        return result;
    }
}
