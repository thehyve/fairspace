package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.util.Ref;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.commits.CommitMessages.withCommitMessage;
import static io.fairspace.saturn.rdf.StoredQueries.storedQuery;
import static java.util.UUID.randomUUID;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

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
        if (template.getUri() != null) {
            throw new IllegalArgumentException("Id shouldn't be set");
        }

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

        withCommitMessage("Create collection " + collection.getPrettyName(),
                () -> rdf.update(storedQuery("coll_create",
                        createResource(collection.getUri()),
                        collection.getPrettyName(),
                        collection.getDirectoryName(),
                        collection.getDescription(),
                        collection.getType(),
                        collection.getCreator())));


        return collection;
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

    public Collection update(Collection collection) {
        withCommitMessage("Update collection " + collection.getUri(),
                () -> rdf.update(storedQuery("coll_update",
                        createResource(collection.getUri()),
                        collection.getPrettyName(),
                        collection.getDescription())));
        return get(collection.getUri());
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
}
