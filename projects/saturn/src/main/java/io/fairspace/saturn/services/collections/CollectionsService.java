package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.rdf.QuerySolutionProcessor;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.parseXSDDateTime;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

// TODO: Check permissions
@Slf4j
public class CollectionsService {
    private final RDFConnection rdf;

    private final Supplier<String> userIriSupplier;


    public CollectionsService(RDFConnection rdf, Supplier<String> userIriSupplier) {
        this.rdf = rdf;
        this.userIriSupplier = userIriSupplier;
    }

    public Collection create(Collection collection) {
        validate(collection.getIri() == null, "Field iri must be left empty");
        validate(collection.getCreator() == null, "Field creator must be left empty");
        validate(collection.getLocation() != null, "Field location must be set");
        validate(isLocationValid(collection.getLocation()), "Invalid location");
        validate(collection.getName() != null && !collection.getName().isEmpty(), "Field prettyName must be set");
        validate(collection.getType() != null, "Field type must be set");

        if (collection.getDescription() == null) {
            collection.setDescription("");
        }

        return commit("Create collection " + collection.getName(), rdf, () -> {
            if (getByLocation(collection.getLocation()) != null) {
                throw new LocationAlreadyExistsException(collection.getLocation());
            }

            rdf.update(storedQuery("coll_create",
                    collection.getName(),
                    collection.getLocation(),
                    collection.getDescription(),
                    collection.getType(),
                    userIriSupplier.get()));

            return getByLocation(collection.getLocation());
        });
    }

    public Collection get(String iri) {
        validateIRI(iri);
        var processor = new QuerySolutionProcessor<>(CollectionsService::toCollection);
        rdf.querySelect(storedQuery("coll_get", createResource(iri)), processor);
        return processor.getSingle().orElse(null);
    }

    public Collection getByLocation(String location) {
        var processor = new QuerySolutionProcessor<>(CollectionsService::toCollection);
        rdf.querySelect(storedQuery("coll_get_by_dir", location), processor);
        return processor.getSingle().orElse(null);
    }

    public List<Collection> list() {
        var processor = new QuerySolutionProcessor<>(CollectionsService::toCollection);
        rdf.querySelect(storedQuery("coll_list"), processor);
        return processor.getValues();
    }

    public void delete(String iri) {
        validateIRI(iri);
        commit("Delete collection " + iri, rdf, () -> {
            var existing = get(iri);
            if (existing == null) {
                log.info("Collection not found {}", iri);
                throw new CollectionNotFoundException(iri);
            }
            if (existing.getAccess() != Access.Manage) {
                log.info("No enough permissions to delete a collection {}", iri);
                throw new CollectionAccessDeniedException(iri);
            }
            rdf.update(storedQuery("coll_delete", createResource(iri),  userIriSupplier.get()));
        });
    }

    public Collection update(Collection patch) {
        validate(patch.getIri() != null, "No IRI");
        validate(patch.getCreator() == null, "Field creator must be left empty");
        validateIRI(patch.getIri());

        return commit("Update collection " + patch.getName(), rdf, () -> {
            var existing = get(patch.getIri());
            if (existing == null) {
                log.info("Collection not found {}", patch.getIri());
                throw new CollectionNotFoundException(patch.getIri());
            }
            if (existing.getAccess().ordinal() < Access.Write.ordinal()) {
                log.info("No enough permissions to modify a collection {}", patch.getIri());
                throw new CollectionAccessDeniedException(patch.getIri());
            }

            validate(patch.getType() == null || patch.getType().equals(existing.getType()),
                    "Cannot change collection's type");

            if (patch.getLocation() != null && !patch.getLocation().equals(existing.getLocation())) {
                var conflicting = getByLocation(patch.getLocation());
                if (conflicting != null) {
                    throw new LocationAlreadyExistsException(patch.getLocation());
                }
                validate(isLocationValid(patch.getLocation()), "Invalid location");
            }

            rdf.update(storedQuery("coll_update",
                    createResource(patch.getIri()),
                    patch.getName() != null ? patch.getName() : existing.getName(),
                    patch.getDescription() != null ? patch.getDescription() : existing.getDescription(),
                    patch.getLocation() != null ? patch.getLocation() : existing.getLocation(),
                    userIriSupplier.get()));

            return get(patch.getIri());
        });
    }

    private static Collection toCollection(QuerySolution row) {
        var collection = new Collection();
        collection.setIri(row.getResource("iri").toString());
        collection.setType(row.getLiteral("type").getString());
        collection.setName(row.getLiteral("name").getString());
        collection.setLocation(row.getLiteral("path").getString());
        collection.setDescription(row.getLiteral("description").getString());
        collection.setCreator(row.getLiteral("createdBy").getString());
        collection.setDateCreated(parseXSDDateTime(row.getLiteral("dateCreated")));
        collection.setDateModified(parseXSDDateTime(row.getLiteral("dateModified")));
        collection.setAccess(Access.Manage); // TODO: Check
        return collection;
    }

    private static boolean isLocationValid(String name) {
        return name.matches("[A-Za-z0-9_-]+")
                && !name.isEmpty()
                && name.length() < 128;
    }

}
