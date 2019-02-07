package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.util.Ref;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static java.util.UUID.randomUUID;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.system.Txn.calculateWrite;

public class CollectionsService {
    private final RDFConnection rdf;

    private final String baseIRI;
    private final Supplier<UserInfo> userInfoSupplier;


    public CollectionsService(RDFConnection rdf, String baseIRI, Supplier<UserInfo> userInfoSupplier) {
        this.rdf = rdf;
        this.baseIRI = baseIRI;
        this.userInfoSupplier = userInfoSupplier;
    }

    public Collection create(Collection template) {
        validate(template.getUri() == null, "Field uri must not be left empty");
        validate(template.getCreator() == null, "Field creator must not be left empty");
        validate(template.getDirectoryName() != null, "Field directoryName must be set");
        validate(isDirectoryNameValid(template.getDirectoryName()), "Invalid directoryName");
        validate(template.getPrettyName() != null && !template.getPrettyName().isEmpty(), "Field prettyName must be set");
        validate(template.getType() != null, "Field type must be set");


        var collection = new Collection();
        collection.setUri(baseIRI + randomUUID());
        collection.setPrettyName(template.getPrettyName());
        collection.setDirectoryName(template.getDirectoryName());
        collection.setDescription(template.getDescription() != null ? template.getDescription() : "");
        collection.setType(template.getType());
        collection.setCreator("");
        if (userInfoSupplier != null) {
            var userInfo = userInfoSupplier.get();
            if (userInfo != null) {
                collection.setCreator(userInfo.getUserId());
            }
        }

        return withCommitMessage("Create collection " + collection.getPrettyName(), () ->
                calculateWrite(rdf, () -> {
                    var exists = new Ref<>(false);
                    rdf.querySelect(storedQuery("fs_stat", collection.getDirectoryName()), row -> exists.value = true);
                    if (exists.value) {
                        return null;
                    }

                    rdf.update(storedQuery("coll_create",
                            createResource(collection.getUri()),
                            collection.getPrettyName(),
                            collection.getDirectoryName(),
                            collection.getDescription(),
                            collection.getType(),
                            collection.getCreator()));
                    return collection;
                }));
    }

    public Collection get(String iri) {
        var result = new Ref<Collection>();

        rdf.querySelect(storedQuery("coll_get", createResource(iri)),
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
        withCommitMessage("Delete collection " + iri,
                () -> rdf.update(storedQuery("coll_delete", createResource(iri))));
    }

    public Collection update(Collection patch) {
        validate(patch.getUri() != null, "No URI");
        validate(patch.getCreator() == null, "Field creator must not be left empty");


        return withCommitMessage("Update collection " + patch.getPrettyName(), () ->
                calculateWrite(rdf, () -> {
                    var existing = get(patch.getUri());
                    if (existing == null) {
                        return null;
                    }

                    validate(patch.getType() == null || patch.getType().equals(existing.getType()),
                            "Cannot change collection's type");

                    rdf.update(storedQuery("coll_update",
                            createResource(patch.getUri()),
                            patch.getPrettyName() != null ? patch.getPrettyName() : existing.getPrettyName(),
                            patch.getDescription() != null ? patch.getDescription() : existing.getDescription(),
                            patch.getDirectoryName() != null ? patch.getDirectoryName() : existing.getDirectoryName()));

                    return get(patch.getUri());
                })
        );
    }

    private static Collection toCollection(QuerySolution row) {
        var collection = new Collection();
        collection.setUri(row.getResource("iri").toString());
        collection.setType(row.getLiteral("type").getString());
        collection.setPrettyName(row.getLiteral("name").getString());
        collection.setDirectoryName(row.getLiteral("path").getString());
        collection.setDescription(row.getLiteral("description").getString());
        collection.setCreator(row.getLiteral("createdBy").getString());
        return collection;
    }

    private static boolean isDirectoryNameValid(String name) {
        return name.indexOf('\u0000') < 0
                && name.indexOf('/') < 0
                && name.indexOf('\\') < 0
                && name.length() < 128;
    }
}
