package io.fairspace.saturn.services.collections;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.rdf.dao.DAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static org.apache.jena.graph.NodeFactory.createURI;

// TODO: Check permissions
@RequiredArgsConstructor
@Slf4j
public class CollectionsService {
    private final DAO dao;
    private final EventBus eventBus;

    public Collection create(Collection collection) {
        validate(collection.getIri() == null, "Field iri must be left empty");
        validate(isLocationValid(collection.getLocation()), "Invalid location");
        validate(collection.getName() != null && !collection.getName().isEmpty(), "Field name must be set");
        validate(collection.getType() != null, "Field type must be set");

        if (collection.getDescription() == null) {
            collection.setDescription("");
        }

        return commit("Create collection " + collection.getName(), dao, () -> {
            if (getByLocation(collection.getLocation()) != null) {
                throw new LocationAlreadyExistsException(collection.getLocation());
            }

            addPermissionsToObject(dao.write(collection));
            eventBus.post(new CollectionCreatedEvent(collection));
            return collection;
        });
    }

    public Collection get(String iri) {
        return addPermissionsToObject(dao.read(Collection.class, createURI(iri)));
    }

    public Collection getByLocation(String location) {
        return dao.construct(Collection.class, storedQuery("coll_get_by_dir", location))
                .stream()
                .findFirst()
                .map(this::addPermissionsToObject)
                .orElse(null);
    }

    public List<Collection> list() {
        var result = dao.list(Collection.class);
        result.forEach(this::addPermissionsToObject);
        return result;
    }

    public void delete(String iri) {
        validateIRI(iri);
        commit("Delete collection " + iri, dao, () -> {
            var collection = get(iri);
            if (collection == null) {
                log.info("Collection not found {}", iri);
                throw new CollectionNotFoundException(iri);
            }
            if (collection.getAccess() != Access.Manage) {
                log.info("No enough permissions to delete a collection {}", iri);
                throw new CollectionAccessDeniedException(iri);
            }

            dao.markAsDeleted(collection);

            eventBus.post(new CollectionDeletedEvent(collection));
        });
    }

    public Collection update(Collection patch) {
        validate(patch.getIri() != null, "No IRI");

        validateIRI(patch.getIri().getURI());

        return commit("Update collection " + patch.getName(), dao, () -> {
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
            if (!updated.getLocation().equals(oldLocation)) {
                eventBus.post(new CollectionMovedEvent(updated, oldLocation));
            }
            return updated;
        });
    }

    private Collection addPermissionsToObject(Collection c) {
        if (c != null) {
            c.setAccess(Access.Manage); // TODO: Call permissions service
        }
        return c;
    }

    private static boolean isLocationValid(String name) {
        return name.matches("[A-Za-z0-9_-]+")
                && !name.isEmpty()
                && name.length() < 128;
    }
}
