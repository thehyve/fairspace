package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.util.Ref;
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

    private final String baseCollectionURI;
    private final Supplier<UserInfo> userInfoSupplier;


    public CollectionsService(RDFConnection rdf, String baseCollectionURI, Supplier<UserInfo> userInfoSupplier) {
        this.rdf = rdf;
        this.baseCollectionURI = baseCollectionURI;
        this.userInfoSupplier = userInfoSupplier;
    }

    public Collection create(Collection template) {
        if (template.getId() != null) {
            throw new IllegalArgumentException("Id shouldn't be set");
        }

        var collection = new Collection();
        collection.setId(baseCollectionURI + randomUUID());
        collection.setName(template.getName());
        collection.setDescription(template.getDescription() != null ? template.getDescription() : "");
        collection.setCreator("");
        if (userInfoSupplier != null) {
            var userInfo = userInfoSupplier.get();
            if (userInfo != null) {
                collection.setCreator(userInfo.getUserId());
            }
        }

        withCommitMessage("Create collection " + collection.getName(),
                () -> rdf.update(storedQuery("coll_create", createResource(collection.getId()), collection.getName(), collection.getDescription(), collection.getCreator())));


        return collection;
    }

    public Collection get(String iri) {
        var result = new Ref<Collection>();

        rdf.querySelect(storedQuery("coll_get", createResource(iri)), row -> {
            var collection = new Collection();
            collection.setId(iri);
            collection.setName(row.getLiteral("name").getString());
            collection.setDescription(row.getLiteral("description").getString());
            collection.setCreator(row.getLiteral("createdBy").getString());
            result.value = collection;
        });

        return result.value;
    }

    public List<Collection> list() {
        var result = new ArrayList<Collection>();

        rdf.querySelect(storedQuery("coll_list"), row -> {
            var collection = new Collection();
            collection.setId(row.getResource("iri").toString());
            collection.setName(row.getLiteral("name").getString());
            collection.setDescription(row.getLiteral("description").getString());
            collection.setCreator(row.getLiteral("createdBy").getString());
            result.add(collection);
        });

        return result;
    }

    public void delete(String iri) {
        withCommitMessage("Delete collection " + iri,
                () -> rdf.update(storedQuery("coll_delete", createResource(iri))));
    }

    public Collection update(Collection collection) {
        withCommitMessage("Update collection " + collection.getId(),
                () -> rdf.update(storedQuery("coll_update", createResource(collection.getId()), collection.getName(), collection.getDescription())));
        return get(collection.getId());
    }


}
