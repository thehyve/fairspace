package io.fairspace.saturn.services.users;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;

public class UserService {
    private static final String ANONYMOUS = "http://fairspace.io/anonymous";
    private final RDFConnection rdf;
    private final Supplier<UserInfo> userInfoSupplier;
    private final Map<String, String> idToUri = new HashMap<>();

    public UserService(RDFConnection rdf, Supplier<UserInfo> userInfoSupplier) {
        this.rdf = rdf;
        this.userInfoSupplier = userInfoSupplier;

        rdf.querySelect(storedQuery("users_list"), row ->
                idToUri.put(row.getLiteral("id").getString(), row.getLiteral("iri").getString()));
    }

    public String getCurrentUserIRI() {
        var userInfo = userInfoSupplier.get();
        if (userInfo == null) {
            return ANONYMOUS;
        }

        var iri = idToUri.get(userInfo.getUserId());
        if (iri != null) {
            return iri;
        }

        if (rdf.isInTransaction() && rdf.transactionMode() == ReadWrite.READ) {
            throw new IllegalStateException("Trying to register a user in a read transaction");
        }

        commit("Store a new user", rdf, () ->
                rdf.update(storedQuery("users_create", userInfo.getUserId(), userInfo.getFullName(), userInfo.getUserName())));

        var processor = new QuerySolutionProcessor<>(row -> row.getLiteral("iri").getString());
        rdf.querySelect(storedQuery("users_by_id", userInfo.getUserId()), processor);
        iri = processor.getSingle().get();
        idToUri.put(userInfo.getUserId(), iri);

        return iri;
    }
}
