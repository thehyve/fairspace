package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import io.fairspace.neptune.web.InvalidCollectionException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.*;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class CollectionServiceTest {
    private CollectionService service;

    @Mock
    private CollectionRepository collectionRepository;

    @Mock
    private PermissionService permissionService;

    @Mock
    private StorageService storageService;

    @Mock
    private CollectionMetadataService collectionMetadataService;

    private List<Collection> collections = Arrays.asList(
            Collection.builder().id(1L).location("quotes").build(),
            Collection.builder().id(2L).location("samples").build());

    @Before
    public void setUp() {
        service = new CollectionService(collectionRepository, permissionService, storageService, collectionMetadataService);

        when(permissionService.getAllBySubject())
                .thenReturn(asList(
                        new Permission(1L, "user1", collections.get(0), Access.Manage),
                        new Permission(2L, "user1", collections.get(1), Access.Read)));

        when(collectionMetadataService.getUri(anyLong())).thenAnswer(invocation -> getUri(invocation.getArgument(0)));
    }

    @Test
    public void testFindAll() {
        List<Collection> mergedCollections = toList(service.findAll().iterator());

        // Both items should be returned with the proper uri
        assertTrue(mergedCollections.contains(collections.get(0).toBuilder().uri(getUri(1L)).build()));
        assertTrue(mergedCollections.contains(collections.get(1).toBuilder().uri(getUri(2L)).build()));
    }

    @Test
    public void testFindById() {
        Long id = 1L;
        Collection collection = new Collection(1L, "quotes", "My quotes", "quote item", null);
        when(collectionRepository.findById(id)).thenReturn(Optional.of(collection));

        Optional<Collection> mergedCollection = service.findById(id);

        assertTrue(mergedCollection.isPresent());
        assertEquals(collection.toBuilder().uri(getUri(1L)).build(), mergedCollection.get());
    }

    @Test
    public void testFindByNonExistingId() {
        Long id = 1L;
        when(collectionRepository.findById(id)).thenReturn(Optional.empty());

        Optional<Collection> mergedCollection = service.findById(id);

        assertTrue(!mergedCollection.isPresent());
    }

    @Test
    public void testAddCollection() throws IOException {
        Long id = 1L;
        Collection collection = new Collection(1L, "quotes", "My quotes", "quote item", null);

        when(collectionRepository.save(any())).thenReturn(collection);

        service.add(collection);

        verify(collectionMetadataService).createCollection(any());
        verify(storageService).addCollection(any());
        verify(permissionService).authorize(any(), eq(true));
    }

    @Test
    public void testAddCollectionReturnsStoredIdAndUri() throws IOException {
        Collection collection = new Collection(1L, "quotes", "My quotes", "quote item", null);
        Collection storedCollection = new Collection(2L, "quotes", "My quotes", "quote item", null);

        when(collectionRepository.save(any())).thenReturn(storedCollection);

        Collection added = service.add(collection);

        assertEquals(storedCollection.getId(), added.getId());
        assertEquals(getUri(added.getId()), added.getUri());
    }

    @Test
    public void testDeleteCollection() throws IOException {
        Long id = 1L;
        Collection collection = new Collection(1L, "quotes", "My quotes", "quote item", null);
        when(collectionRepository.findById(id)).thenReturn(Optional.of(collection));

        service.delete(id);

        verify(storageService).deleteCollection(collection);
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testDeleteCollectionNotFound() {
        Long id = 1L;
        when(collectionRepository.findById(id)).thenReturn(Optional.empty());

        service.delete(id);
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
