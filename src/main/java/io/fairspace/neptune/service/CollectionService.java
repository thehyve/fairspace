package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.repository.CollectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static java.util.Objects.requireNonNull;
import static java.util.stream.Collectors.groupingBy;

/**
 * Merges data from the collection repository and the metadatastore
 */
@Service
public class CollectionService {
    private CollectionRepository repository;
    private CollectionMetadataService collectionMetadataService;

    @Autowired
    public CollectionService(CollectionRepository repository, CollectionMetadataService collectionMetadataService) {
        this.repository = repository;
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

    public Collection add(Collection collection) {
        Collection savedCollection = repository.save(collection);

        // Update typeIdentifier based on given id
        Long id = savedCollection.getId();
        repository.save(new Collection(savedCollection.getId(), savedCollection.getType(), id.toString(), null));

        // Update metadata. Ensure that the correct uri is specified
        CollectionMetadata metadataToSave = new CollectionMetadata(collectionMetadataService.getUri(id), collection.getMetadata().getName(), collection.getMetadata().getDescription());
        collectionMetadataService.createCollection(metadataToSave);
        return collection;
    }

    public Collection update(Long id, Collection patch) {
        // Updating is currently only possible on the metadata
        CollectionMetadata metadataToSave = new CollectionMetadata(collectionMetadataService.getUri(id), patch.getMetadata().getName(), patch.getMetadata().getDescription());
        collectionMetadataService.patchCollection(metadataToSave);
        return patch;
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
