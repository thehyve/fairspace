package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatcher;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
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

        when(collectionMetadataService.getCollectionUri(anyLong())).thenAnswer(invocation -> getUri(invocation.getArgument(0)));
    }

    @Test
    public void testFindAll() {
        List<Collection> mergedCollections = toList(service.findAll().iterator());

        // Both items should be returned with the proper uri
        assertTrue(mergedCollections.contains(collections.get(0).toBuilder().uri(getUri(1L)).access(Access.Manage).build()));
        assertTrue(mergedCollections.contains(collections.get(1).toBuilder().uri(getUri(2L)).access(Access.Read).build()));
    }

    @Ignore
    @Test
    public void testFindById() {
        Long id = 1L;
        Collection collection = Collection.builder()
                .name("My Quotes")
                .description("quote item")
                .id(1L)
                .location("quotes")
                .access(Access.Read)
                .dateCreated(ZonedDateTime.now(ZoneOffset.UTC))
                .build();
        when(collectionRepository.findById(id)).thenReturn(Optional.of(collection));

        Collection mergedCollection = service.findById(id);

        assertEquals(collection.toBuilder().uri(getUri(1L)).build(), mergedCollection);
    }

    @Ignore
    @Test
    public void testFindByNonExistingId() {
        Long id = 1L;
        when(collectionRepository.findById(id)).thenReturn(Optional.empty());

        service.findById(id);
    }


    @Test
    public void testAddCollection() throws IOException {
        Collection collection = Collection.builder()
                .name("My Quotes")
                .description("quote item")
                .id(1L)
                .location("quotes")
                .access(Access.Write)
                .build();

        when(collectionRepository.save(any())).thenReturn(collection);

        service.add(collection);

        verify(collectionMetadataService).createCollection(any());
        verify(storageService).addCollection(any());

        ArgumentMatcher<Collection> collectionMatcher = argument ->
            collection.getId().equals(argument.getId()) &&
            collection.getName().equals(argument.getName()) &&
            collection.getDescription().equals(argument.getDescription());

        verify(permissionService).authorize(argThat(collectionMatcher), eq(Access.Manage), eq(true));
    }

    @Test
    public void testAddCollectionReturnsStoredIdAndUri() throws IOException {
        Collection collection = Collection.builder()
                .name("My Quotes")
                .description("quote item")
                .id(1L)
                .location("quotes")
                .access(Access.Write)
                .build();
        Collection storedCollection = Collection.builder()
                .name("My Quotes")
                .description("quote item")
                .id(2L)
                .location("quotes")
                .access(Access.Write)
                .dateCreated(ZonedDateTime.now(ZoneOffset.UTC))
                .build();

        when(collectionRepository.save(any())).thenReturn(storedCollection);

        Collection added = service.add(collection);

        assertEquals(storedCollection.getId(), added.getId());
        assertEquals(getUri(added.getId()), added.getUri());
    }

    @Test
    public void testDeleteCollection() throws IOException {
        Long id = 1L;
        Collection collection = Collection.builder()
                .name("My Quotes")
                .description("quote item")
                .id(1L)
                .location("quotes")
                .access(Access.Write)
                .dateCreated(ZonedDateTime.now(ZoneOffset.UTC))
                .build();
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

    @Test
    public void testPatchCollection() throws IOException {
        Collection original = Collection.builder()
                .name("oldName")
                .description("oldDescription")
                .id(1L)
                .location("oldName-1")
                .dateCreated(ZonedDateTime.now(ZoneOffset.UTC))
                .build();

        Collection patch =
                 Collection.builder().name("newName!").description("newDescription").build();

        when(collectionRepository.findById(eq(1L))).thenReturn(Optional.of(original));
        when(collectionRepository.save(any())).then(invocation -> invocation.getArgument(0));

        service.update(1L, patch);

        verify(permissionService).checkPermission(eq(Access.Write), eq(Long.valueOf(1L)));
        verify(storageService).moveCollection(argThat(c -> c.getLocation().equals("oldName-1")), eq("newName_-1"));
        verify(collectionMetadataService).patchCollection(argThat(c -> c.getName().equals("newName!") && c.getDescription().equals("newDescription")));

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
