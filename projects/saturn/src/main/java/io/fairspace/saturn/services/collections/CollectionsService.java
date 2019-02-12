package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.util.Ref;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTime;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.system.Txn.calculateWrite;
import static org.apache.jena.system.Txn.executeWrite;

// TODO: Check permissions
public class CollectionsService {
    private final RDFConnection rdf;

    private final Supplier<UserInfo> userInfoSupplier;


    public CollectionsService(RDFConnection rdf, Supplier<UserInfo> userInfoSupplier) {
        this.rdf = rdf;
        this.userInfoSupplier = userInfoSupplier;
    }

    public Collection create(Collection collection) {
        validate(collection.getUri() == null, "Field uri must not be left empty");
        validate(collection.getCreator() == null, "Field creator must not be left empty");
        validate(collection.getLocation() != null, "Field location must be set");
        validate(isDirectoryNameValid(collection.getLocation()), "Invalid location");
        validate(collection.getName() != null && !collection.getName().isEmpty(), "Field prettyName must be set");
        validate(collection.getType() != null, "Field type must be set");

        if (collection.getDescription() == null) {
            collection.setDescription("");
        }

        return withCommitMessage("Create collection " + collection.getName(), () ->
                calculateWrite(rdf, () -> {
                    if (getByDirectoryName(collection.getLocation()) != null) {
                        return null;
                    }

                    rdf.update(storedQuery("coll_create",
                            collection.getName(),
                            collection.getLocation(),
                            collection.getDescription(),
                            collection.getType(),
                            userId()));

                    return getByDirectoryName(collection.getLocation());
                }));
    }

    public Collection get(String iri) {
        var result = new Ref<Collection>();

        rdf.querySelect(storedQuery("coll_get", createResource(iri)),
                row -> result.value = toCollection(row));

        return result.value;
    }

    public Collection getByDirectoryName(String name) {
        var result = new Ref<Collection>();

        rdf.querySelect(storedQuery("coll_get_by_dir", name),
                row -> result.value = toCollection(row));

        return result.value;
    }

    public List<Collection> list() {
        var result = new ArrayList<Collection>();

        rdf.querySelect(storedQuery("coll_list"),
                row -> result.add(toCollection(row)));

        return result;
    }

    public void delete(String iri) {
        withCommitMessage("Delete collection " + iri, () ->
                executeWrite(rdf, () -> {
                    var existing = get(iri);
                    if (existing == null) {
                        throw new IllegalArgumentException("Couldn't delete " + iri);
                    }
                    rdf.update(storedQuery("coll_delete", createResource(iri), userId()));
                }));
    }

    public Collection update(Collection patch) {
        validate(patch.getUri() != null, "No URI");
        validate(patch.getCreator() == null, "Field creator must not be left empty");


        return withCommitMessage("Update collection " + patch.getName(), () ->
                calculateWrite(rdf, () -> {
                    var existing = get(patch.getUri());
                    if (existing == null) {
                        return null;
                    }

                    validate(patch.getType() == null || patch.getType().equals(existing.getType()),
                            "Cannot change collection's type");

                    rdf.update(storedQuery("coll_update",
                            createResource(patch.getUri()),
                            patch.getName() != null ? patch.getName() : existing.getName(),
                            patch.getDescription() != null ? patch.getDescription() : existing.getDescription(),
                            patch.getLocation() != null ? patch.getLocation() : existing.getLocation()));

                    return get(patch.getUri());
                })
        );
    }

    private static Collection toCollection(QuerySolution row) {
        var collection = new Collection();
        collection.setUri(row.getResource("iri").toString());
        collection.setType(row.getLiteral("type").getString());
        collection.setName(row.getLiteral("name").getString());
        collection.setLocation(row.getLiteral("path").getString());
        collection.setDescription(row.getLiteral("description").getString());
        collection.setCreator(row.getLiteral("createdBy").getString());
        collection.setDateCreated(parseXSDDateTime(row.getLiteral("dateCreated")));
        collection.setAccess(Access.Manage); // TODO: Check
        return collection;
    }

    private static boolean isDirectoryNameValid(String name) {
        return name.indexOf('\u0000') < 0
                && name.indexOf('/') < 0
                && name.indexOf('\\') < 0
                && name.length() < 128;
    }

    private String userId() {
        if (userInfoSupplier != null) {
            var userInfo = userInfoSupplier.get();
            if (userInfo != null) {
                return userInfo.getUserId();
            }
        }
        return "";
    }
}
