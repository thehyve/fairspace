package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.UnauthorizedException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
public class CollectionServiceIntegrationTest {
    @Autowired
    private CollectionService service;

    @MockBean
    private StorageService storageService;

    @MockBean
    private CollectionMetadataService collectionMetadataService;

    @MockBean
    private AuthorizationContainer authorizationContainer;

    Collection collection;

    @Before
    public void setUp() throws IOException {
        when(authorizationContainer.getSubject()).thenReturn("user1");

        // Add a test collection for this user
        collection = service.add(Collection.builder()
                .name("new collection")
                .description("my description")
                .build());
    }

    @Test
    public void testAddCollection() throws IOException {

        ZonedDateTime beforeTest = ZonedDateTime.now(ZoneOffset.UTC);

        Collection collection = Collection.builder()
                .name("new collection")
                .description("my description")
                .build();

        // Store the collection
        Collection storedCollection = service.add(collection);

        // Retrieve again for verification
        Collection foundCollection = service.findById(storedCollection.getId());

        ZonedDateTime afterTest = ZonedDateTime.now(ZoneOffset.UTC);

        assertEquals(storedCollection, foundCollection);
        assertEquals(storedCollection.getCreator(),("user1"));
        assert(beforeTest.isBefore(storedCollection.getDateCreated()) ||
                beforeTest.equals(storedCollection.getDateCreated()) );
        assert(afterTest.isAfter(storedCollection.getDateCreated()) ||
                afterTest.equals(storedCollection.getDateCreated()) );

    }

    @Test
    public void testCollectionIsVisibleForDefaultUser() {
        // For the default user, the collection is visible
        service.findById(collection.getId()); // Shouldn't throw an exception
    }

    @Test
    public void testCollectionCanBeFoundByLocation() {
        Collection byLocation = service.findByLocation(collection.getLocation());
        assertEquals(byLocation, collection);
    }

    @Test(expected = UnauthorizedException.class)
    public void testCollectionNotVisibleForOthersByDefault() {
        // For another user, the collection is not visible
        when(authorizationContainer.getSubject()).thenReturn("other-nonexisting-user");
        service.findById(collection.getId());
    }

    @Test
    public void testCollectionNotInListForOthers() {
        // The list of all collections is empty for the other user
        when(authorizationContainer.getSubject()).thenReturn("other-nonexisting-user");
        assertFalse(service.findAll().iterator().hasNext());
    }



}
