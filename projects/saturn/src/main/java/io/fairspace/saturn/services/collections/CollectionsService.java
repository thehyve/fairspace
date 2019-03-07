package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.rdf.dao.DAO;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdfconnection.RDFConnection;

import java.util.List;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

// TODO: Check permissions
@Slf4j
public class CollectionsService {
    private final RDFConnection rdf;
    private final DAO dao;

    private final Supplier<String> userIriSupplier;


    public CollectionsService(RDFConnection rdf, Supplier<String> userIriSupplier) {
        this.rdf = rdf;
        this.userIriSupplier = userIriSupplier;
        this.dao = new DAO(rdf, userIriSupplier);
    }

    public Collection create(Collection collection) {
        validate(collection.getIri() == null, "Field iri must be left empty");
        validate(isLocationValid(collection.getLocation()), "Invalid location");
        validate(collection.getName() != null && !collection.getName().isEmpty(), "Field name must be set");
        validate(collection.getType() != null, "Field type must be set");

        if (collection.getDescription() == null) {
            collection.setDescription("");
        }

        return commit("Create collection " + collection.getName(), rdf, () -> {
            if (getByLocation(collection.getLocation()) != null) {
                throw new LocationAlreadyExistsException(collection.getLocation());
            }

            return dao.write(collection);
        });
    }

    public Collection get(String iri) {
        return applyPermissions(dao.read(Collection.class, createURI(iri)));
    }

    public Collection getByLocation(String location) {
        return dao.construct(Collection.class, storedQuery("coll_get_by_dir", location))
                .stream()
                .findFirst()
                .map(this::applyPermissions)
                .orElse(null);
    }

    public List<Collection> list() {
        var result = dao.list(Collection.class);
        result.forEach(this::applyPermissions);
        return result;
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
            dao.markAsDeleted(existing);
        });
    }

    public Collection update(Collection patch) {
        validate(patch.getIri() != null, "No IRI");

        validateIRI(patch.getIri().getURI());

        return commit("Update collection " + patch.getName(), rdf, () -> {
            var existing = get(patch.getIri().getURI());
            if (existing == null) {
                log.info("Collection not found {}", patch.getIri());
                throw new CollectionNotFoundException(patch.getIri().getURI());
            }
            if (existing.getAccess().ordinal() < Access.Write.ordinal()) {
                log.info("No enough permissions to modify a collection {}", patch.getIri());
                throw new CollectionAccessDeniedException(patch.getIri().getURI());
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

            if (patch.getName() != null) {
                existing.setName(patch.getName());
            }

            if (patch.getDescription() != null) {
                existing.setDescription(patch.getDescription());
            }

            var oldLocation = existing.getLocation();
            if (patch.getLocation() != null) {
                existing.setLocation(patch.getLocation());
            }

            var updated = dao.write(existing);
            rdf.update(storedQuery("fs_move", oldLocation, updated.getLocation(), ""));
            return updated;
        });
    }

    private Collection applyPermissions(Collection c) {
        if (c != null) {
            c.setAccess(Access.Manage); // Call permissions service
        }
        return c;
    }

    private static boolean isLocationValid(String name) {
        return name.matches("[A-Za-z0-9_-]+")
                && !name.isEmpty()
                && name.length() < 128;
    }

}
