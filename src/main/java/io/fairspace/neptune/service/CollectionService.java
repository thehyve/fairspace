package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.UnauthorizedException;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import io.fairspace.neptune.web.InvalidCollectionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import static java.util.stream.Collectors.toList;

/**
 * Merges data from the collection repository and the metadatastore
 */
@Service
@Slf4j
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

    public List<Collection> findAll() {
        return permissionService
                .getAllBySubject()
                .stream()
                .map(p -> p.getCollection()
                        .toBuilder()
                        .access(p.getAccess())
                        .uri(collectionMetadataService.getCollectionUri(p.getCollection().getId()))
                        .build())
                .collect(toList());
    }

    public Collection findById(Long collectionId) {
        Permission permission = permissionService.getSubjectsPermission(collectionId);
        if (permission.getAccess().compareTo(Access.Read) < 0) {
            throw new UnauthorizedException("Unauthorized");
        }

        return permission.getCollection()
                .toBuilder()
                .uri(collectionMetadataService.getCollectionUri(collectionId))
                .access(permission.getAccess())
                .build();
    }

    public Collection add(Collection collection) throws IOException {

        Collection savedCollection = repository.save(collection
                .toBuilder()
                .creator(permissionService.getSubject())
                .dateCreated(ZonedDateTime.now(ZoneOffset.UTC))
                .build());

        // Update location based on given id
        Long id = savedCollection.getId();
        Collection finalCollection;
        try {
            finalCollection = repository.save(savedCollection.toBuilder().location(Locations.location(savedCollection.getName(), id)).build());
        } catch (DataIntegrityViolationException e) {
            throw new InvalidCollectionException(e);
        }

        // Add the uri
        finalCollection = finalCollection.toBuilder().uri(collectionMetadataService.getCollectionUri(finalCollection.getId())).build();

        // Authorize the user
        permissionService.authorize(finalCollection, Access.Manage, true);

        // Update metadata. Only log an error if it fails, as the neptune
        // database is the source of truth
        try {
            collectionMetadataService.createCollection(finalCollection);
        } catch (Exception e) {
            log.warn("An error occurred while storing collection metadata for collection id" + finalCollection.getId());
        }

        // Create a place for storing collection contents
        // TODO: Handle error when adding the storage for the collection
        storageService.addCollection(finalCollection);

        return finalCollection.toBuilder().access(Access.Manage).build();
    }

    public Collection update(Long id, Collection patch) {
        permissionService.checkPermission(Access.Write, id);

        Optional<Collection> optionalCollection = repository.findById(id);

        return optionalCollection.map(collection -> {
            // Add properties from outside
            Collection.CollectionBuilder builder = collection.toBuilder();
            if (!StringUtils.isEmpty(patch.getName()) && !patch.getName().equals(collection.getName())) {
                String location = Locations.location(patch.getName(), collection.getId());
                builder.name(patch.getName()).location(location);

                try {
                    storageService.moveCollection(collection, location);
                } catch (IOException e) {
                    throw new UncheckedIOException(e);
                }
            }

            builder.description(Optional.ofNullable(patch.getDescription()).orElse(""));

            // Store in the database
            Collection savedCollection = repository.save(builder.build());

            // Update metadata. Only log an error if it fails, as the neptune
            // database is the source of truth
            try {
                collectionMetadataService.patchCollection(savedCollection);
            } catch (Exception e) {
                log.warn("An error occurred while storing collection metadata for collection id" + savedCollection.getId());
            }

            return savedCollection;
        }).orElseThrow(CollectionNotFoundException::new);
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
