package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import lombok.AllArgsConstructor;
import org.apache.jena.graph.Node;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.lang.String.format;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.system.Txn.calculateRead;

@AllArgsConstructor
public class PermissionsServiceImpl implements PermissionsService {
    private final RDFConnection rdf;
    private final Supplier<Node> userIriSupplier;

    @Override
    public void createResource(Node resource) {
        rdf.update(storedQuery("permissions_set", resource, userIriSupplier.get(), toNode(Access.Manage)));
    }

    @Override
    public void setPermission(Node resource, Node user, Access access) {
        commit(format("Setting permission for resource %s, user %s to %s", resource, user, access), rdf, () -> {
            validate(!user.equals(userIriSupplier.get()), "A user may not change his own permissions");
            ensureHasAccess(resource, Access.Manage);

            if (access == Access.None) {
                rdf.update(storedQuery("permissions_delete", resource, user));
            } else {
                rdf.update(storedQuery("permissions_set", resource, user, toNode(access)));
            }
        });
    }

    @Override
    public Access getPermission(Node resource) {
            var processor = new QuerySolutionProcessor<>(PermissionsServiceImpl::getAccess);
            rdf.querySelect(storedQuery("permissions_get_for_user", resource, userIriSupplier.get()), processor);
            return processor.getSingle().orElse(Access.None);
    }

    @Override
    public Map<Node, Access> getPermissions(Node resource) {
        return calculateRead(rdf, () -> {
            ensureHasAccess(resource, Access.Read);
            var result = new HashMap<Node, Access>();
            rdf.querySelect(storedQuery("permissions_get_all", resource), row ->
                    result.put(row.getResource("user").asNode(), getAccess(row)));
            return result;
        });
    }

    @Override
    public boolean isReadOnly(Node resource) {
        return calculateRead(rdf, () -> {
            ensureHasAccess(resource, Access.Read);
            return rdf.queryAsk(storedQuery("permissions_is_readonly", resource));
        });
    }

    @Override
    public void setReadOnly(Node resource, boolean readOnly) {
        commit(format("Setting fs:readOnly attribute of resource %s to %s", resource, readOnly), rdf, () ->
                rdf.update(storedQuery("permissions_set_readonly", resource, readOnly)));
    }

    private static Access getAccess(QuerySolution row) {
        var access = row.getResource("access").getLocalName();
        return Stream.of(Access.values()).filter(e -> e.name().equalsIgnoreCase(access)).findFirst().orElse(Access.None);
    }

    private static Node toNode(Access access) {
        return createURI("http://fairspace.io/ontology#" + access.name().toLowerCase());
    }

    private void ensureHasAccess(Node resource, Access access) {
        if (getPermission(resource).ordinal() < access.ordinal()) {
            throw new IllegalArgumentException(format("User %s has no %s access to resource %s", userIriSupplier.get(), access.name().toLowerCase(), resource));
        }
    }
}
