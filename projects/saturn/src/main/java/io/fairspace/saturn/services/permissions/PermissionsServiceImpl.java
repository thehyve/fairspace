package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import io.fairspace.saturn.services.AccessDeniedException;
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
    public void createResource(Node resource, Node authority) {
        rdf.update(storedQuery("permissions_create_resource", resource, authority, userIriSupplier.get()));
    }

    @Override
    public void setPermission(Node resource, Node user, Access access) {
        commit(format("Setting permission for resource %s, user %s to %s", resource, user, access), rdf, () -> {
            ensureHasAccess(resource, Access.Manage);
            validate(!user.equals(userIriSupplier.get()), "A user may not change his own permissions");
            if (!isCollection(resource)) {
                validate(access != Access.Read, "Regular metadata entities can not be marked as read-only");
                var isSpecifyingWriteAccessOnNonRestrictedResource = access == Access.Write && !isWriteRestricted(resource);
                validate(!isSpecifyingWriteAccessOnNonRestrictedResource,
                        "Regular metadata entities must be marked as write-restricted before granting permissions");
            }

            if (access == Access.None) {
                rdf.update(storedQuery("permissions_delete", resource, user));
            } else {
                rdf.update(storedQuery("permissions_set", resource, user, toNode(access)));
            }
        });
    }

    @Override
    public Access getPermission(Node resource) {
        return calculateRead(rdf, () -> {
            var authority = getAuthority(resource);
            var processor = new QuerySolutionProcessor<>(PermissionsServiceImpl::getAccess);
            rdf.querySelect(storedQuery("permissions_get_for_user", authority, userIriSupplier.get()), processor);
            return processor.getSingle().orElseGet(() -> defaultAccess(authority));
        });
    }

    @Override
    public Map<Node, Access> getPermissions(Node resource) {
        return calculateRead(rdf, () -> {
            var authority = getAuthority(resource);
            ensureHasAccess(authority, Access.Read);

            var result = new HashMap<Node, Access>();
            rdf.querySelect(storedQuery("permissions_get_all", authority), row ->
                    result.put(row.getResource("user").asNode(), getAccess(row)));
            return result;
        });
    }

    @Override
    public boolean isWriteRestricted(Node resource) {
        return rdf.queryAsk(storedQuery("permissions_is_restricted", resource));
    }

    @Override
    public void setWriteRestricted(Node resource, boolean restricted) {
        commit(format("Setting fs:writeRestricted attribute of resource %s to %s", resource, restricted), rdf, () -> {
            ensureHasAccess(resource, Access.Manage);
            validate(!isCollection(resource), "A collection cannot be marked as write-restricted");
            if (restricted != isWriteRestricted(resource)) {
                rdf.update(storedQuery("permissions_set_restricted", resource, restricted));
            }
        });
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
            throw new AccessDeniedException(format("User %s has no %s access to resource %s", userIriSupplier.get(), access.name().toLowerCase(), resource));
        }
    }

    private boolean isCollection(Node resource) {
        return rdf.queryAsk(storedQuery("is_collection", resource));
    }


    private Access defaultAccess(Node resource) {
        return isCollection(resource) ? Access.None : isWriteRestricted(resource) ? Access.Read : Access.Write;
    }

    private Node getAuthority(Node resource) {
        var processor = new QuerySolutionProcessor<>(row -> row.getResource("authority").asNode());
        rdf.querySelect(storedQuery("permissions_get_authority", resource), processor);
        return processor.getSingle().orElse(resource);
    }
}
