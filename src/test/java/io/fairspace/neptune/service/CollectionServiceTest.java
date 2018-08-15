package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.repository.CollectionRepository;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatcher;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class CollectionServiceTest {
    private CollectionService service;

    @Mock
    private CollectionRepository collectionRepository;

    @Mock
    private CollectionMetadataService collectionMetadataService;

    @Before
    public void setUp() throws Exception {
        service = new CollectionService(collectionRepository, collectionMetadataService);
        when(collectionMetadataService.getUri(anyLong())).thenAnswer(invocation -> getUri(invocation.getArgument(0)));
    }

    @Test
    public void testFindAll() {
        List<Collection> collections = new ArrayList<>();
        collections.add(new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", null));
        collections.add(new Collection(2L, Collection.CollectionType.LOCAL_FILE, "samples", null));
        when(collectionRepository.findAll()).thenReturn(collections);

        List<CollectionMetadata> metadata = new ArrayList<>();
        metadata.add(new CollectionMetadata(getUri(1L), "My quotes", "quote item"));
        metadata.add(new CollectionMetadata(getUri(3L), "My dataset", "dataset"));
        when(collectionMetadataService.getCollections()).thenReturn(metadata);

        List<Collection> mergedCollections = toList(service.findAll().iterator());

        // The first item should be merged
        assertTrue(mergedCollections.contains(collections.get(0).addMetadata(metadata.get(0))));

        // The second item does not have any metadata, and should be added as is
        assertTrue(mergedCollections.contains(collections.get(1)));

        // The 3rd item should not be present, as there is only metadata
        assertEquals(2, mergedCollections.size());
    }

    @Test
    public void testFindById() {
        Long id = 1L;
        Collection collection = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", null);
        when(collectionRepository.findById(id)).thenReturn(Optional.of(collection));

        CollectionMetadata metadata = new CollectionMetadata(getUri(1L), "My quotes", "quote item");
        when(collectionMetadataService.getCollection(getUri(id))).thenReturn(Optional.of(metadata));

        Optional<Collection> mergedCollection = service.findById(id);

        assertTrue(mergedCollection.isPresent());
        assertEquals(collection.addMetadata(metadata), mergedCollection.get());
    }

    @Test
    public void testFindByNonExistingId() {
        Long id = 1L;
        when(collectionRepository.findById(id)).thenReturn(Optional.empty());

        Optional<Collection> mergedCollection = service.findById(id);

        assertTrue(!mergedCollection.isPresent());
        verify(collectionMetadataService, times(0)).getCollection(anyString());
    }

    @Test
    public void testFindByIdWithoutMetadata() {
        Long id = 1L;
        Collection collection = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", null);
        when(collectionRepository.findById(id)).thenReturn(Optional.of(collection));

        when(collectionMetadataService.getCollection(getUri(id))).thenReturn(Optional.empty());

        Optional<Collection> mergedCollection = service.findById(id);

        assertTrue(mergedCollection.isPresent());
        assertEquals(collection, mergedCollection.get());
    }

    private <E> List<E> toList(Iterator<E> iterator) {
        List<E> list = new ArrayList<>();
        iterator.forEachRemaining(list::add);
        return list;
    }

    private String getUri(Long id) {
        return "/fairspace/" + id;
    }
}