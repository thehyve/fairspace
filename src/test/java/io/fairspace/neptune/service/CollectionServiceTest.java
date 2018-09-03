package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import io.fairspace.neptune.web.InvalidCollectionException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class CollectionServiceTest {
    private CollectionService service;

    @Mock
    private CollectionRepository collectionRepository;

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private StorageService storageService;

    @Mock
    private CollectionMetadataService collectionMetadataService;

    @Before
    public void setUp() {
        service = new CollectionService(collectionRepository, authorizationService, storageService, collectionMetadataService);

        when(authorizationService.findByUser(eq("user1")))
                .thenReturn(asList(
                        new Authorization(1L, "user1", 1L, Permission.Manage),
                        new Authorization(2L, "user1", 2L, Permission.Read)));

        when(collectionMetadataService.getUri(anyLong())).thenAnswer(invocation -> getUri(invocation.getArgument(0)));
    }

    @Test
    public void testFindAll() {
        List<Collection> collections = new ArrayList<>();
        collections.add(new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", null));
        collections.add(new Collection(2L, Collection.CollectionType.LOCAL_FILE, "samples", null));
        when(collectionRepository.findAllById(asList(1L, 2L))).thenReturn(collections);

        List<CollectionMetadata> metadata = new ArrayList<>();
        metadata.add(new CollectionMetadata(getUri(1L), "My quotes", "quote item"));
        metadata.add(new CollectionMetadata(getUri(3L), "My dataset", "dataset"));
        when(collectionMetadataService.getCollections()).thenReturn(metadata);

        List<Collection> mergedCollections = toList(service.findAll("user1").iterator());

        // The first item should be merged
        assertTrue(mergedCollections.contains(collections.get(0).withMetadata(metadata.get(0))));

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

        Optional<Collection> mergedCollection = service.findById(id, "user1");

        assertTrue(mergedCollection.isPresent());
        assertEquals(collection.withMetadata(metadata), mergedCollection.get());
    }

    @Test
    public void testFindByNonExistingId() {
        Long id = 1L;
        when(collectionRepository.findById(id)).thenReturn(Optional.empty());

        Optional<Collection> mergedCollection = service.findById(id, "user1");

        assertTrue(!mergedCollection.isPresent());
        verify(collectionMetadataService, times(0)).getCollection(anyString());
    }

    @Test
    public void testFindByIdWithoutMetadata() {
        Long id = 1L;
        Collection collection = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", null);
        when(collectionRepository.findById(id)).thenReturn(Optional.of(collection));

        when(collectionMetadataService.getCollection(getUri(id))).thenReturn(Optional.empty());

        Optional<Collection> mergedCollection = service.findById(id, "user1");

        assertTrue(mergedCollection.isPresent());
        assertEquals(collection, mergedCollection.get());
    }

    @Test
    public void testAddCollection() throws IOException {
        Long id = 1L;
        CollectionMetadata metadata = new CollectionMetadata("http://uri", "collection", "description");
        Collection collection = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", metadata);

        when(collectionRepository.save(any())).thenReturn(collection);

        service.add(collection, "user");

        verify(collectionMetadataService).createCollection(any());
        verify(storageService).addCollection(any());
        verify(authorizationService).add(any(), eq(null));
    }

    @Test(expected = InvalidCollectionException.class)
    public void testAddCollectionWithoutMetadata() throws IOException {
        Long id = 1L;
        Collection collection = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", null);

        service.add(collection, "user");
    }

    @Test
    public void testAddCollectionReturnsStoredIdAndUri() throws IOException {
        CollectionMetadata metadata = new CollectionMetadata("http://uri", "collection", "description");
        Collection collection = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", metadata);
        Collection storedCollection = new Collection(2L, Collection.CollectionType.LOCAL_FILE, "quotes", metadata);

        when(collectionRepository.save(any())).thenReturn(storedCollection);

        Collection added = service.add(collection, "user");

        assertEquals(storedCollection.getId(), added.getId());
        verify(collectionMetadataService).createCollection(new CollectionMetadata("/fairspace/2", "collection", "description"));
    }

    @Test
    public void testDeleteCollection() throws IOException {
        Long id = 1L;
        Collection collection = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "quotes", null);
        when(collectionRepository.findById(id)).thenReturn(Optional.of(collection));

        service.deleteById(id, "user1");

        verify(storageService).deleteCollection(collection);
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testDeleteCollectionNotFound() throws IOException {
        Long id = 1L;
        when(collectionRepository.findById(id)).thenReturn(Optional.empty());

        service.deleteById(id, "user1");
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
