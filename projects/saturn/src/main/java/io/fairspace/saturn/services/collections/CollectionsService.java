package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.CollectionAccessDeniedException;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.MiltonException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.CollectionResource;
import io.milton.resource.FolderResource;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.graph.Node;
import org.apache.jena.vocabulary.RDF;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static io.fairspace.saturn.audit.Audit.audit;
import static io.fairspace.saturn.auth.RequestContext.showDeletedFiles;
import static io.fairspace.saturn.rdf.dao.DAO.entityFromResource;
import static io.fairspace.saturn.util.ValidationUtils.validate;
import static io.fairspace.saturn.util.ValidationUtils.validateIRI;
import static io.fairspace.saturn.webdav.PathUtils.encodePath;
import static java.util.Comparator.comparing;
import static java.util.stream.Collectors.toList;
import static org.apache.commons.lang3.StringUtils.isBlank;
import static org.apache.commons.lang3.StringUtils.isNotEmpty;
import static org.apache.jena.graph.NodeFactory.createURI;

@Deprecated(forRemoval = true) // Access WebDAV directly
@Slf4j
public class CollectionsService {
    private final String baseIri;
    private final Transactions transactions;
    private final ResourceFactory resourceFactory;
    private final PermissionsService permissions;
    private final String basePath;

    @SneakyThrows
    public CollectionsService(String baseIri, Transactions transactions, ResourceFactory resourceFactory, PermissionsService permissions) {
        this.baseIri = baseIri;
        this.basePath = new URI(baseIri).getPath();
        this.transactions = transactions;
        this.resourceFactory = resourceFactory;
        this.permissions = permissions;
    }

    public Collection create(Collection collection) {
        validate(collection.getIri() == null, "Field iri must be left empty");

        collection.setIri(createURI(baseIri + encodePath(collection.getLocation())));

        if (isBlank(collection.getConnectionString())) {
            collection.setConnectionString("");
        }
        validateFields(collection);

        if (collection.getDescription() == null) {
            collection.setDescription("");
        }

        var storedCollection = transactions.calculateWrite(dataset -> {
            checkWorkspace(collection.getOwnerWorkspace());
            ensureLocationIsNotUsed(collection.getLocation());
            new DAO(dataset).write(collection);
            permissions.createResource(collection.getIri(), collection.getOwnerWorkspace());
            collection.setAccess(Access.Manage);
            return collection;
        });

        audit("COLLECTION_CREATED",
                "name", storedCollection.getName(),
                "location", storedCollection.getLocation(),
                "iri", storedCollection.getIri().getURI());

        return storedCollection;
    }

    public Collection get(String iri) {
        return transactions.calculateRead(ds -> addPermissionsToObject(new DAO(ds).read(Collection.class, createURI(iri), showDeletedFiles())));
    }

    public Collection getByLocation(String location) {
        return transactions.calculateRead(dataset -> getByLocationWithoutAccess(location)
                .map(this::addPermissionsToObject)
                .orElse(null));
    }

    private Optional<Collection> getByLocationWithoutAccess(String location) {
        return transactions.calculateRead(ds -> ds.getDefaultModel().listSubjectsWithProperty(FS.filePath, location)
                .filterKeep(r -> r.hasProperty(RDF.type, FS.Collection) && (showDeletedFiles() || !r.hasProperty(FS.dateDeleted)))
                .nextOptional()
                .map(r -> entityFromResource(Collection.class, r)));
    }

    private void checkWorkspace(Node ownerWorkspace) {
        validate(ownerWorkspace != null, "ownerWorkspace is missing");

        transactions.executeRead(ds -> {
            var ws = ds.getDefaultModel().wrapAsResource(ownerWorkspace);
            validate(ws.hasProperty(RDF.type, FS.Workspace), "Invalid workspace IRI");
            validate(!ws.hasProperty(FS.dateDeleted), "Workspace is deleted");
            permissions.ensureAccess(Set.of(ownerWorkspace), Access.Write);
        });
    }


    private void ensureLocationIsNotUsed(String location) {
        if (getByLocationWithoutAccess(location).isPresent()) {
            throw new LocationAlreadyExistsException(location);
        }
    }

    public List<Collection> list() {
        return transactions.calculateRead(ds -> {
            var collections = new DAO(ds).list(Collection.class, showDeletedFiles());

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
        try {
            permissions.ensureAdmin();
        } catch (AccessDeniedException e) {
            log.info("Not enough permissions to delete collections, {}", iri);
            throw new CollectionAccessDeniedException("Insufficient permissions to delete collections.", iri);
        }
        validateIRI(iri);
        var c = transactions.calculateWrite(ds -> {
            var collection = get(iri);
            if (collection == null) {
                log.info("Collection not found {}", iri);
                throw new CollectionNotFoundException(iri);
            }

            try {
                collectionResource(collection.getLocation()).delete();
            } catch (MiltonException e) {
                throw new RuntimeException(e);
            }

            return collection;

        });


        audit("COLLECTION_DELETED",
                "iri", iri,
                "name", c.getName(),
                "location", c.getLocation());
    }

    private CollectionResource rootResource() {
        try {
            return (CollectionResource) resourceFactory.getResource(null, basePath);
        } catch (NotAuthorizedException | BadRequestException e) {
            throw new RuntimeException(e);
        }
    }

    private FolderResource collectionResource(String location) {
        try {
            return (FolderResource) rootResource().child(location);
        } catch (NotAuthorizedException | BadRequestException e) {
            throw new RuntimeException(e);
        }
    }

    public Collection update(Collection patch) {
        validate(patch.getIri() != null, "No IRI");

        validateIRI(patch.getIri().getURI());
        var restored = new boolean[]{false};

        var c = transactions.calculateWrite(ds -> {
            var collection = get(patch.getIri().getURI());
            if (collection == null) {
                log.info("Collection not found {}", patch.getIri());
                throw new CollectionNotFoundException(patch.getIri().getURI());
            }
            if (!collection.getAccess().canWrite()) {
                log.info("Not enough permissions to modify a collection {}", patch.getIri());
                throw new CollectionAccessDeniedException("Insufficient permissions to modify a collection", patch.getIri().getURI());
            }

            if (collection.getDateDeleted() != null) {
                validate(patch.getDateDeleted() == null, "Cannot update a collection without restoring it");
                collection = new DAO(ds).restore(collection);
                restored[0] = true;
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
            collection = new DAO(ds).write(collection);

            if (!collection.getLocation().equals(oldLocation)) {
                try {
                    collectionResource(oldLocation).moveTo(rootResource(), collection.getLocation());
                } catch (MiltonException e) {
                    throw new RuntimeException(e);
                }
            }

            return addPermissionsToObject(collection);
        });

        audit(restored[0] ? "COLLECTION_RESTORED" : "COLLECTION_UPDATED",
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
            if (c.getAccess() == Access.None) {
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
