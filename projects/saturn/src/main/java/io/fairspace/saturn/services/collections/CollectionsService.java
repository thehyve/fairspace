package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.vocabulary.RDF;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;

import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.rdf.dao.DAO.entityFromResource;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotEmpty;
import static org.apache.jena.graph.NodeFactory.createURI;

@Slf4j
public class CollectionsService {
    private final String baseIri;
    private final DAO dao;
    private final Consumer<Object> eventListener;
    private final PermissionsService permissions;

    public CollectionsService(String baseIri, DAO dao, Consumer<Object> eventListener, PermissionsService permissions) {
        this.baseIri = baseIri;
        this.dao = dao;
        this.eventListener = eventListener;
        this.permissions = permissions;
    }

    public String getBaseIri() {
        return baseIri;
    }

    public Collection create(Collection collection) {
        validate(collection.getIri() == null, "Field iri must be left empty");

        collection.setIri(createURI(baseIri + collection.getLocation()));

        if (isBlank(collection.getConnectionString())) {
            collection.setConnectionString("");
        }
        validateFields(collection);

        if (collection.getDescription() == null) {
            collection.setDescription("");
        }

        var storedCollection = dao.getDataset().calculateWrite(() -> {
            checkWorkspace(collection.getOwnerWorkspace());
            ensureLocationIsNotUsed(collection.getLocation());
            dao.write(collection);

            collection.setAccess(Access.Manage);
            eventListener.accept(new CollectionCreatedEvent(collection));
            return collection;
        });

        audit("COLLECTION_CREATED",
                "name", storedCollection.getName(),
                "location", storedCollection.getLocation(),
                "iri", storedCollection.getIri().getURI());

        return storedCollection;
    }

    public Collection get(String iri) {
        return addPermissionsToObject(dao.read(Collection.class, createURI(iri)));
    }

    public Collection getByLocation(String location) {
        return dao.getDataset().calculateRead(() -> getByLocationWithoutAccess(location)
                .map(this::addPermissionsToObject)
                .orElse(null));
    }

    private Optional<Collection> getByLocationWithoutAccess(String location) {
        return dao.getDataset().getDefaultModel().listSubjectsWithProperty(FS.filePath, location)
                .filterKeep(r -> r.hasProperty(RDF.type, FS.Collection))
                .filterDrop(r -> r.hasProperty(FS.dateDeleted))
                .nextOptional()
                .map(r -> entityFromResource(Collection.class, r));
    }

    private void checkWorkspace(Node ownerWorkspace) {
        validate(ownerWorkspace != null, "ownerWorkspace is missing");

        var ws = dao.getDataset().getDefaultModel().asRDFNode(ownerWorkspace).asResource();
        validate(ws.hasProperty(RDF.type, FS.Workspace), "Invalid workspace IRI");
        validate(!ws.hasProperty(FS.dateDeleted), "Workspace is deleted");
        permissions.ensureAccess(Set.of(ownerWorkspace), Access.Write);
    }


    private void ensureLocationIsNotUsed(String location) {
        if(getByLocationWithoutAccess(location).isPresent()) {
            throw new LocationAlreadyExistsException(location);
        }
    }

    public List<Collection> list() {
        return dao.getDataset().calculateRead(() -> {
            var collections = dao.list(Collection.class);

            var iris = collections.stream().map(Collection::getIri).collect(toList());
            var userPermissions = permissions.getPermissions(iris);

            return collections.stream()
                    .filter(c -> {
                        c.setAccess(userPermissions.get(c.getIri()));
                        return c.canRead();
                    })
                    .sorted(comparing(Collection::getName))
                    .collect(toList());
        });
    }

    public void delete(String iri) {
        validateIRI(iri);
        var c = dao.getDataset().calculateWrite(() -> {
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

            // Emit event on internal eventbus so the filesystem can act accordingly
            eventListener.accept(new CollectionDeletedEvent(collection));

            return collection;
        });

        audit("COLLECTION_DELETED",
                "iri", iri,
                "name", c.getName(),
                "location", c.getLocation());
    }

    public Collection update(Collection patch) {
        validate(patch.getIri() != null, "No IRI");

        validateIRI(patch.getIri().getURI());

        var c = dao.getDataset().calculateWrite(() -> {
            var collection = get(patch.getIri().getURI());
            if (collection == null) {
                log.info("Collection not found {}", patch.getIri());
                throw new CollectionNotFoundException(patch.getIri().getURI());
            }
            if (!collection.getAccess().canWrite()) {
                log.info("No enough permissions to modify a collection {}", patch.getIri());
                throw new AccessDeniedException("Insufficient permissions for collection " + patch.getIri().getURI());
            }

            var oldLocation = collection.getLocation();
            if (patch.getLocation() != null && !patch.getLocation().equals(collection.getLocation())) {
                ensureLocationIsNotUsed(patch.getLocation());
                collection.setLocation(patch.getLocation());
            }

            if (patch.getConnectionString() != null) {
                collection.setConnectionString(patch.getConnectionString());
            }

            if (patch.getName() != null) {
                collection.setName(patch.getName());
            }

            if (patch.getDescription() != null) {
                collection.setDescription(patch.getDescription());
            }
            
            validate(patch.getOwnerWorkspace() == null || patch.getOwnerWorkspace().equals(collection.getOwnerWorkspace()),
                    "Collection ownership cannot be changed");

            validateFields(collection);
            collection = dao.write(collection);

            if (!collection.getLocation().equals(oldLocation)) {
                eventListener.accept(new CollectionMovedEvent(collection, oldLocation));
            }
            return collection;
        });

        audit("COLLECTION_UPDATED",
                "iri", c.getIri().getURI(),
                "name", c.getName(),
                "location", c.getLocation());

        return c;
    }

    private void validateFields(Collection collection) {
        validate(isLocationValid(collection.getLocation()), "Invalid location");
        validate(isNotEmpty(collection.getName()), "Field name must be set");
        validate(collection.getName().length() <= 128, "Field name must contain no more than 128 characters");
        validate(collection.getConnectionString() != null, "Field type must be set");
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
