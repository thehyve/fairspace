package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import io.fairspace.neptune.web.InvalidCollectionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * Merges data from the collection repository and the metadatastore
 */
@Service
public class CollectionService {
    private CollectionRepository repository;
    private AuthorizationService authorizationService;
    private StorageService storageService;
    private CollectionMetadataService collectionMetadataService;

    @Autowired
    public CollectionService(CollectionRepository repository, AuthorizationService authorizationService, StorageService storageService, CollectionMetadataService collectionMetadataService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
        this.storageService = storageService;
        this.collectionMetadataService = collectionMetadataService;
    }

    public Iterable<Collection> findAll() {
        Iterable<Collection> collections = repository.findAll();
        List<CollectionMetadata> metadata = collectionMetadataService.getCollections();

        // Merge collections with metadata
        return StreamSupport.stream(collections.spliterator(), false)
                .map(collection -> {
                    String uri = collectionMetadataService.getUri(collection.getId());

                    return metadata.stream()
                            .filter(Objects::nonNull)
                            .filter(m -> uri.equals(m.getUri()))
                            .findFirst()
                            .map(collection::withMetadata)
                            .orElse(collection);
                })
                .collect(Collectors.toList());

    }

    public Optional<Collection> findById(Long id) {
        // First retrieve collection itself
        Optional<Collection> optionalCollection = repository.findById(id);

        return optionalCollection
                .map(collection -> {
                    // If it exists, retrieve metadata
                    Optional<CollectionMetadata> optionalMetadata = collectionMetadataService.getCollection(collectionMetadataService.getUri(id));

                    return optionalMetadata
                            .map(collection::withMetadata)
                            .orElse(collection);
                });

    }

    public Collection add(Collection collection) throws IOException {
        if(collection.getMetadata() == null) {
            throw new InvalidCollectionException();
        }

        Collection savedCollection = repository.save(collection);

        // Update location based on given id
        Long id = savedCollection.getId();
        Collection finalCollection = repository.save(new Collection(savedCollection.getId(), savedCollection.getType(), id.toString(), savedCollection.getOwner(), null));

        Authorization authorization = new Authorization();
        authorization.setCollectionId(finalCollection.getId());
        authorization.setUser(collection.getOwner());
        authorization.setAccess(Permission.Manage);
        authorizationService.add(authorization);

        // Update metadata. Ensure that the correct uri is specified
        CollectionMetadata metadataToSave = new CollectionMetadata(collectionMetadataService.getUri(id), collection.getMetadata().getName(), collection.getMetadata().getDescription());
        collectionMetadataService.createCollection(metadataToSave);

        // Create a place for storing collection contents
        storageService.addCollection(collection);

        return finalCollection.withMetadata(metadataToSave);
    }

    public Collection update(Long id, Collection patch) {
        if(patch.getMetadata() == null) {
            throw new InvalidCollectionException();
        }

        // Updating is currently only possible on the metadata
        CollectionMetadata metadataToSave = new CollectionMetadata(collectionMetadataService.getUri(id), patch.getMetadata().getName(), patch.getMetadata().getDescription());
        collectionMetadataService.patchCollection(metadataToSave);
        return patch;
    }

    public void deleteById(Long id) {
        Optional<Collection> collection = repository.findById(id);

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
