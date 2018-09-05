package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.verify;
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
        Collection collection = Collection.builder()
                .name("new collection")
                .description("my description")
                .build();

        // Store the collection
        Collection storedCollection = service.add(collection);

        // Retrieve again for verification
        Optional<Collection> foundCollection = service.findById(storedCollection.getId());

        assertTrue(foundCollection.isPresent());
        assertEquals(storedCollection, foundCollection.get());
    }


    @Test
    public void testCollectionIsVisibleForDefaultUser() {
        // For the default user, the collection is visible
        Optional<Collection> foundCollection = service.findById(collection.getId());
        assertTrue(foundCollection.isPresent());
    }

    @Test(expected = AccessDeniedException.class)
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
