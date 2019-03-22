package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Consumer;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.util.stream.Collectors.toList;
import static org.apache.jena.graph.NodeFactory.createURI;

@RequiredArgsConstructor
@Slf4j
public class CollectionsService {
    private final DAO dao;
    private final Consumer<Object> eventListener;
    private final PermissionsService permissions;

    public Collection create(Collection collection) {
        validate(collection.getIri() == null, "Field iri must be left empty");
        validate(isLocationValid(collection.getLocation()), "Invalid location");
        validate(collection.getName() != null && !collection.getName().isEmpty(), "Field name must be set");
        validate(collection.getType() != null, "Field type must be set");

        if (collection.getDescription() == null) {
            collection.setDescription("");
        }

        return commit("Create collection " + collection.getName(), dao, () -> {
            ensureLocationIsNotUsed(collection.getLocation());
            dao.write(collection);
            permissions.createResource(collection.getIri());
            collection.setAccess(Access.Manage);
            eventListener.accept(new CollectionCreatedEvent(collection));
            return collection;
        });
    }

    public Collection get(String iri) {
        return addPermissionsToObject(dao.read(Collection.class, createURI(iri)));
    }

    public Collection getByLocation(String location) {
        return getByLocationWithoutAccess(location)
                .map(this::addPermissionsToObject)
                .orElse(null);
    }

    private Optional<Collection> getByLocationWithoutAccess(String location) {
        return dao.construct(Collection.class, storedQuery("coll_get_by_dir", location))
                .stream()
                .findFirst();
    }

    private void ensureLocationIsNotUsed(String location) {
        if(getByLocationWithoutAccess(location).isPresent()) {
            throw new LocationAlreadyExistsException(location);
        }
    }

    public List<Collection> list() {
        return dao.list(Collection.class)
                .stream()
                .map(this::addPermissionsToObject)
                .filter(Objects::nonNull)
                .collect(toList());
    }

    public void delete(String iri) {
        validateIRI(iri);
        commit("Delete collection " + iri, dao, () -> {
            var collection = get(iri);
            if (collection == null) {
                log.info("Collection not found {}", iri);
                throw new CollectionNotFoundException(iri);
            }
            if (!collection.getAccess().canManage()) {
                log.info("No enough permissions to delete a collection {}", iri);
                throw new AccessDeniedException("Insufficient permissions for collection " + iri);
            }

            dao.markAsDeleted(collection);

            eventListener.accept(new CollectionDeletedEvent(collection));
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
            if (!existing.getAccess().canWrite()) {
                log.info("No enough permissions to modify a collection {}", patch.getIri());
                throw new AccessDeniedException("Insufficient permissions for collection " + patch.getIri().getURI());
            }

            validate(patch.getType() == null || patch.getType().equals(existing.getType()),
                    "Cannot change collection's type");

            if (patch.getLocation() != null && !patch.getLocation().equals(existing.getLocation())) {
                ensureLocationIsNotUsed(patch.getLocation());
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
                eventListener.accept(new CollectionMovedEvent(updated, oldLocation));
            }
            return updated;
        });
    }

    private Collection addPermissionsToObject(Collection c) {
        if (c != null) {
            c.setAccess(permissions.getPermission(c.getIri()));
            if(c.getAccess() == Access.None) {
                return null;
            }
        }
        return c;
    }

    private static boolean isLocationValid(String name) {
        return name.matches("[A-Za-z0-9_-]+")
                && !name.isEmpty()
                && name.length() < 128;
    }
}
