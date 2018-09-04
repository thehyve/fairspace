package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Optional;
import java.util.stream.StreamSupport;

import static java.util.stream.Collectors.toList;

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
        Iterable<Collection> collections =
                repository.findAllById(
                        authorizationService
                                .getAllByCurrentUser()
                                .stream()
                                .map(Authorization::getCollectionId)
                                .collect(toList()));

        // Add the uri for metadata lookup
        return StreamSupport.stream(collections.spliterator(), false)
                .map(collection -> {
                    String uri = collectionMetadataService.getUri(collection.getId());
                    return collection.toBuilder().uri(uri).build();
                })
                .collect(toList());
    }

    public Optional<Collection> findById(Long id) {
        authorizationService.checkPermission(Permission.Read, id);

        // First retrieve collection itself
        Optional<Collection> optionalCollection = repository.findById(id);

        return optionalCollection
                .map(collection -> {
                    String uri = collectionMetadataService.getUri(collection.getId());
                    return collection.toBuilder().uri(uri).build();
                });

    }

    public Collection add(Collection collection) throws IOException {
        Collection savedCollection = repository.save(collection);

        // Update location based on given id
        Long id = savedCollection.getId();
        Collection finalCollection = repository.save(savedCollection.toBuilder().location(id.toString()).build());

        // Add the uri
        finalCollection = finalCollection.toBuilder().uri(collectionMetadataService.getUri(finalCollection.getId())).build();

        Authorization authorization = new Authorization();
        authorization.setCollectionId(finalCollection.getId());
        authorization.setUser(authorizationService.getCurrentUser());
        authorization.setPermission(Permission.Manage);
        authorizationService.authorize(authorization, true);

        // Update metadata. Ensure that the correct uri is specified
        collectionMetadataService.createCollection(finalCollection);

        // Create a place for storing collection contents
        storageService.addCollection(finalCollection);

        return finalCollection;
    }

    public Collection update(Long id, Collection patch) {
        authorizationService.checkPermission(Permission.Write, id);

        Optional<Collection> optionalCollection = repository.findById(id);

        return optionalCollection.map(collection -> {
            // Add properties from outside
            Collection.CollectionBuilder builder = collection.toBuilder();
            if(!StringUtils.isEmpty(patch.getName())) {
                builder.name(patch.getName());
            }

            if(!StringUtils.isEmpty(patch.getDescription())) {
                builder.name(patch.getDescription());
            }

            // Store in the database
            Collection savedCollection = repository.save(builder.build());

            // Also update the metadata
            collectionMetadataService.patchCollection(savedCollection);

            return savedCollection;
        }).orElseThrow(CollectionNotFoundException::new);
    }

    public void delete(Long id) {
        Optional<Collection> collection = repository.findById(id);

        authorizationService.checkPermission(Permission.Manage, id);

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
