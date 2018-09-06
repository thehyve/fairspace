package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import io.fairspace.neptune.web.InvalidCollectionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Optional;

import static java.util.stream.Collectors.toList;

/**
 * Merges data from the collection repository and the metadatastore
 */
@Service
public class CollectionService {
    private CollectionRepository repository;
    private PermissionService permissionService;
    private StorageService storageService;
    private CollectionMetadataService collectionMetadataService;

    @Autowired
    public CollectionService(CollectionRepository repository, PermissionService permissionService, StorageService storageService, CollectionMetadataService collectionMetadataService) {
        this.repository = repository;
        this.permissionService = permissionService;
        this.storageService = storageService;
        this.collectionMetadataService = collectionMetadataService;
    }

    public Iterable<Collection> findAll() {
        List<Collection> collections =
                permissionService
                        .getAllBySubject()
                        .stream()
                        .map(p -> p.getCollection().withAccess(p.getAccess()))
                        .collect(toList());

        List<CollectionMetadata> metadata = collectionMetadataService.getCollections();

        // Merge collections with metadata
        return collections.stream()
                .map(collection -> {
                    String uri = collectionMetadataService.getUri(collection.getId());

                    return metadata.stream()
                            .filter(m -> uri.equals(m.getUri()))
                            .findFirst()
                            .map(collection::withMetadata)
                            .orElse(collection);
                })
                .collect(toList());

    }

    public Collection findById(Long collectionId) {
        Permission permission = permissionService.getSubjectsPermission(collectionId);
        if (permission.getAccess().compareTo(Access.Read) < 0) {
            throw new AccessDeniedException("Unauthorized");
        }
        Collection collection = permission.getCollection().withAccess(permission.getAccess());

        // If it exists, retrieve metadata
        Optional<CollectionMetadata> optionalMetadata = collectionMetadataService.getCollection(collectionMetadataService.getUri(collectionId));

        return optionalMetadata
                .map(collection::withMetadata)
                .orElse(collection);
    }

    public Collection add(Collection collection) throws IOException {
        if (collection.getMetadata() == null) {
            throw new InvalidCollectionException();
        }

        Collection savedCollection = repository.save(collection);

        // Update location based on given id
        Long id = savedCollection.getId();
        Collection finalCollection = repository.save(new Collection(savedCollection.getId(), savedCollection.getType(), id.toString(), null, null));

        Permission permission = new Permission();
        permission.setCollection(finalCollection);
        permission.setSubject(permissionService.getSubject());
        permission.setAccess(Access.Manage);
        permissionService.authorize(permission, true);

        // Update metadata. Ensure that the correct uri is specified
        CollectionMetadata metadataToSave = new CollectionMetadata(collectionMetadataService.getUri(id), collection.getMetadata().getName(), collection.getMetadata().getDescription());
        collectionMetadataService.createCollection(metadataToSave);

        // Create a place for storing collection contents
        storageService.addCollection(collection);

        return finalCollection.withMetadata(metadataToSave).withAccess(Access.Manage);
    }

    public Collection update(Long id, Collection patch) {
        if (patch.getMetadata() == null) {
            throw new InvalidCollectionException();
        }

        permissionService.checkPermission(Access.Write, id);

        // Updating is currently only possible on the metadata
        CollectionMetadata metadataToSave = new CollectionMetadata(collectionMetadataService.getUri(id), patch.getMetadata().getName(), patch.getMetadata().getDescription());
        collectionMetadataService.patchCollection(metadataToSave);
        return patch;
    }

    public void delete(Long id) {
        Optional<Collection> collection = repository.findById(id);

        permissionService.checkPermission(Access.Manage, id);

        collection.map(foundCollection -> {
            // Remove contents of the collection as well
            try {
                storageService.deleteCollection(foundCollection);
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
            repository.deleteById(id);

            return foundCollection;
        }).orElseThrow(CollectionNotFoundException::new);
    }

}
