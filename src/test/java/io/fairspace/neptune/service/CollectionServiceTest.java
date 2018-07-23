package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.ObjectType;
import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.model.TripleObject;
import io.fairspace.neptune.vocabulary.Fairspace;
import io.fairspace.neptune.vocabulary.Rdf;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.net.URI;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class CollectionServiceTest {
    private static final String COLLECTION_URI = "http://example.com";
    private static final String COLLECTION_NAME = "name";
    private static final String COLLECTION_DESCRIPTION = "desc";

    @MockBean
    private TripleService tripleService;

    @Autowired
    private CollectionService collectionService;

    @Test
    public void collectionsWithAllPropertiesShouldBeAccepted() {
        Collection c = new Collection();
        c.setUri(URI.create(COLLECTION_URI));
        c.setName(COLLECTION_NAME);
        c.setDescription(COLLECTION_DESCRIPTION);

        collectionService.createCollection(c);

        verify(tripleService, times(1)).postTriples(Arrays.asList(
                new Triple(COLLECTION_URI, Rdf.TYPE,
                        new TripleObject(ObjectType.uri, Fairspace.COLLECTION.toString(), null, null)),
                new Triple(COLLECTION_URI, Fairspace.NAME,
                        new TripleObject(ObjectType.literal, COLLECTION_NAME, null, null)),
                new Triple(COLLECTION_URI, Fairspace.DESCRIPTION,
                        new TripleObject(ObjectType.literal, COLLECTION_DESCRIPTION, null, null))));
    }

    @Test
    public void collectionsWithEmptyDescriptionShouldBeAccepted() {
        Collection c = new Collection();
        c.setUri(URI.create(COLLECTION_URI));
        c.setName(COLLECTION_NAME);

        collectionService.createCollection(c);

        verify(tripleService, times(1)).postTriples(Arrays.asList(
                new Triple(COLLECTION_URI, Rdf.TYPE,
                        new TripleObject(ObjectType.uri, Fairspace.COLLECTION.toString(), null, null)),
                new Triple(COLLECTION_URI, Fairspace.NAME,
                        new TripleObject(ObjectType.literal, COLLECTION_NAME, null, null)),
                new Triple(COLLECTION_URI, Fairspace.DESCRIPTION,
                        new TripleObject(ObjectType.literal, "", null, null))));
    }

    @Test(expected = RuntimeException.class)
    public void collectionsWithEmptyNameShouldBeRejected() {
        Collection c = new Collection();
        c.setUri(URI.create(COLLECTION_URI));
        c.setDescription(COLLECTION_DESCRIPTION);

        collectionService.createCollection(c);
        verify(tripleService, never()).postTriples(any());
    }

    @Test
    public void collectionsShouldBeSerializedProperly() {
        when(tripleService.executeConstructQuery(any()))
                .thenReturn(Arrays.asList(
                        new Triple(COLLECTION_URI, Rdf.TYPE,
                                new TripleObject(ObjectType.uri, Fairspace.COLLECTION.toString(), null, null)),
                        new Triple(COLLECTION_URI, Fairspace.NAME,
                                new TripleObject(ObjectType.literal, COLLECTION_NAME, null, null)),
                        new Triple(COLLECTION_URI, Fairspace.DESCRIPTION,
                                new TripleObject(ObjectType.literal, COLLECTION_DESCRIPTION, null, null))));

        List<Collection> collections = collectionService.getCollections();

        assertEquals(1, collections.size());
        assertEquals(URI.create(COLLECTION_URI), collections.get(0).getUri());
        assertEquals(COLLECTION_NAME, collections.get(0).getName());
        assertEquals(COLLECTION_DESCRIPTION, collections.get(0).getDescription());
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableName() {
        Collection c = new Collection();
        c.setUri(URI.create(COLLECTION_URI));
        c.setName(COLLECTION_NAME);
        c.setDescription(COLLECTION_DESCRIPTION);

        collectionService.createCollection(c);

        c.setName(COLLECTION_NAME+"test");

        collectionService.patchCollection(c);

        verify(tripleService, times(1)).patchTriples(Arrays.asList(
                new Triple(COLLECTION_URI, Fairspace.NAME,
                        new TripleObject(ObjectType.literal, COLLECTION_NAME+"test", null, null)),
                new Triple(COLLECTION_URI, Fairspace.DESCRIPTION,
                        new TripleObject(ObjectType.literal, COLLECTION_DESCRIPTION, null, null))));
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableDescription() {
        Collection c = new Collection();
        c.setUri(URI.create(COLLECTION_URI));
        c.setName(COLLECTION_NAME);
        c.setDescription(COLLECTION_DESCRIPTION);

        collectionService.createCollection(c);

        c.setDescription(COLLECTION_DESCRIPTION+"test");

        collectionService.patchCollection(c);

        verify(tripleService, times(1)).patchTriples(Arrays.asList(
                new Triple(COLLECTION_URI, Fairspace.NAME,
                        new TripleObject(ObjectType.literal, COLLECTION_NAME, null, null)),
                new Triple(COLLECTION_URI, Fairspace.DESCRIPTION,
                        new TripleObject(ObjectType.literal, COLLECTION_DESCRIPTION+"test", null, null))));
    }

}
