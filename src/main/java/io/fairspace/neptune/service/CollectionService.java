package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
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
                    Optional<CollectionMetadata> collectionMetadata = metadata.stream()
                            .filter(Objects::nonNull)
                            .filter(m -> uri.equals(m.getUri()))
                            .findFirst();

                    if (collectionMetadata.isPresent()) {
                        return collection.addMetadata(collectionMetadata.get());
                    } else {
                        return collection;
                    }
                })
                .collect(Collectors.toList());

    }

    public Optional<Collection> findById(Long id) {
        Optional<Collection> collection = repository.findById(id);

        if(!collection.isPresent()) {
            return collection;
        }

        // Retrieve metadata
        Optional<CollectionMetadata> metadata = collectionMetadataService.getCollection(collectionMetadataService.getUri(id));

        if(!metadata.isPresent()) {
            return collection;
        }
        return Optional.of(collection.get().addMetadata(metadata.get()));
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
