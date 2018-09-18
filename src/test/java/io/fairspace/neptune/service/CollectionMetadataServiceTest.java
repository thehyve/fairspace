package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.vocabulary.Fairspace;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.GregorianCalendar;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class CollectionMetadataServiceTest {
    private static final String COLLECTION_URI = "http://example.com";
    private static final String COLLECTION_NAME = "name";
    private static final String COLLECTION_DESCRIPTION = "desc";
    private static final Long COLLECTION_ID = 126L;
    private static final String BASE_URL = "http://base.io";
    private static final String EXPECTED_URI = BASE_URL + "/iri/collections/" + COLLECTION_ID;
    private static final String CREATOR = "user1";
    private static final ZonedDateTime CREATIONDATETIME = ZonedDateTime.now(ZoneOffset.UTC);

    @Mock
    private TripleService tripleService;

    private CollectionMetadataService collectionMetadataService;

    @Before
    public void setUp() throws Exception {
        collectionMetadataService = new CollectionMetadataService(tripleService, BASE_URL);
    }

    @Test
    public void collectionsWithAllPropertiesShouldBeAccepted() throws IOException {
        Collection c = getCollection();

        collectionMetadataService.createCollection(c);

        verify(tripleService, times(1))
                .postTriples(argThat(m -> m.size() == 5
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        RDF.type,
                        Fairspace.Collection)
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.description,
                        m.createLiteral(c.getDescription()))
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.creator,
                        m.createLiteral("http://fairspace.io/users/user1"))
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.dateCreated,
                        m.createTypedLiteral(GregorianCalendar.from(c.getDateCreated())))
                ));
    }

    @Test
    public void collectionsWithEmptyDescriptionShouldBeAccepted() {
        Collection c = Collection.builder()
                .id(COLLECTION_ID)
                .name(COLLECTION_NAME)
                .creator(CREATOR)
                .dateCreated(CREATIONDATETIME)
                .build();

        collectionMetadataService.createCollection(c);

        verify(tripleService, times(1))
                .postTriples(argThat(m -> m.size() == 5
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        RDF.type,
                        Fairspace.Collection)
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.description,
                        m.createLiteral(""))
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.creator,
                        m.createLiteral("http://fairspace.io/users/user1"))
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.dateCreated,
                        m.createTypedLiteral(GregorianCalendar.from(c.getDateCreated())
                ))));
    }

    @Test(expected = RuntimeException.class)
    public void collectionsWithEmptyNameShouldBeRejected() {
        Collection c = Collection.builder()
                .id(COLLECTION_ID)
                .description(COLLECTION_DESCRIPTION)
                .build();

        collectionMetadataService.createCollection(c);
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableName() {
        Collection c = Collection.builder()
                .id(COLLECTION_ID)
                .name(COLLECTION_NAME)
                .build();

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 1
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))));
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableDescription() {
        Collection c = Collection.builder()
                .id(COLLECTION_ID)
                .description(COLLECTION_DESCRIPTION)
                .build();

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 1
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.description,
                        m.createLiteral(c.getDescription()))));
    }

    @Test
    public void collectionsWithPropertiesShouldBeAbleToPatchBoth() {
        Collection c = getCollection();

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 2
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))
                        && m.contains(
                        m.createResource(EXPECTED_URI),
                        Fairspace.description,
                        m.createLiteral(c.getDescription()))));
    }

    @Test
    public void collectionsWithPropertiesShouldDoNothingWhenBothEmpty() {
        Collection c = Collection.builder()
                .id(COLLECTION_ID)
                .build();

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1)).patchTriples(argThat(Model::isEmpty));
    }

    @Test
    public void testGetUri() {
        assertEquals("http://base.io/iri/collections/12", collectionMetadataService.getUri(12L));
    }

    private Collection getCollection() {
        return Collection.builder()
                .name(COLLECTION_NAME)
                .description(COLLECTION_DESCRIPTION)
                .uri(COLLECTION_URI)
                .id(COLLECTION_ID)
                .creator(CREATOR)
                .dateCreated(CREATIONDATETIME)
                .build();
    }

}
