package io.fairspace.neptune.service;

import io.fairspace.neptune.model.CollectionMetadata;
import io.fairspace.neptune.vocabulary.Fairspace;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest
public class CollectionMetadataServiceTest {
    private static final String COLLECTION_URI = "http://example.com";
    private static final String COLLECTION_NAME = "name";
    private static final String COLLECTION_DESCRIPTION = "desc";

    @MockBean
    private TripleService tripleService;

    @Autowired
    private CollectionMetadataService collectionMetadataService;


    @Test
    public void collectionsWithAllPropertiesShouldBeAccepted() {
        CollectionMetadata c = getCollection();

        collectionMetadataService.createCollection(c);

        verify(tripleService, times(1))
                .postTriples(argThat(m -> m.size() == 3
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        RDF.type,
                        Fairspace.Collection)
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.description,
                        m.createLiteral(c.getDescription()))));
    }

    @Test
    public void collectionsWithEmptyDescriptionShouldBeAccepted() {
        CollectionMetadata c = new CollectionMetadata();
        c.setUri(COLLECTION_URI);
        c.setName(COLLECTION_NAME);

        collectionMetadataService.createCollection(c);

        verify(tripleService, times(1))
                .postTriples(argThat(m -> m.size() == 3
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        RDF.type,
                        Fairspace.Collection)
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.description,
                        m.createLiteral(""))));
    }

    @Test(expected = RuntimeException.class)
    public void collectionsWithEmptyNameShouldBeRejected() {
        CollectionMetadata c = new CollectionMetadata();
        c.setUri(COLLECTION_URI);
        c.setDescription(COLLECTION_DESCRIPTION);

        collectionMetadataService.createCollection(c);
    }

    @Test
    public void collectionsShouldBeDeserializedProperly() {
        Model m = createDefaultModel();
        m.add(
                m.createResource(COLLECTION_URI),
                RDF.type,
                Fairspace.Collection);
        m.add(
                m.createResource(COLLECTION_URI),
                Fairspace.name,
                m.createLiteral(COLLECTION_NAME));
        m.add(
                m.createResource(COLLECTION_URI),
                Fairspace.description,
                m.createLiteral(COLLECTION_DESCRIPTION));

        when(tripleService.executeConstructQuery(any()))
                .thenReturn(m);

        List<CollectionMetadata> collectionMetadata = collectionMetadataService.getCollections();

        assertEquals(1, collectionMetadata.size());
        assertEquals(COLLECTION_URI, collectionMetadata.get(0).getUri());
        assertEquals(COLLECTION_NAME, collectionMetadata.get(0).getName());
        assertEquals(COLLECTION_DESCRIPTION, collectionMetadata.get(0).getDescription());
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableName() {
        CollectionMetadata c = getCollection();

        collectionMetadataService.createCollection(c);

        c.setDescription(null);
        c.setName(COLLECTION_NAME + "test");

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 1
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))));
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableDescription() {
        CollectionMetadata c = getCollection();

        collectionMetadataService.createCollection(c);

        c.setName(null);
        c.setDescription(COLLECTION_DESCRIPTION + "test");

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 1
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.description,
                        m.createLiteral(c.getDescription()))));
    }

    @Test
    public void collectionsWithPropertiesShouldBeAbleToPatchBoth() {
        CollectionMetadata c = getCollection();

        collectionMetadataService.createCollection(c);

        c.setName(COLLECTION_NAME + "test");
        c.setDescription(COLLECTION_DESCRIPTION + "test");

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 2
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.description,
                        m.createLiteral(c.getDescription()))));
    }

    @Test
    public void collectionsWithPropertiesShouldDoNothingWhenBothEmpty() {
        CollectionMetadata c = getCollection();

        collectionMetadataService.createCollection(c);

        c.setName(null);
        c.setDescription(null);

        collectionMetadataService.patchCollection(c);

        verify(tripleService, times(1)).patchTriples(argThat(Model::isEmpty));
    }

    @Test
    public void testGetUri() {
        assertEquals("http://fairspace.com/iri/collections/12", collectionMetadataService.getUri(12L));
    }

    private CollectionMetadata getCollection() {
        CollectionMetadata c = new CollectionMetadata();
        c.setUri(COLLECTION_URI);
        c.setName(COLLECTION_NAME);
        c.setDescription(COLLECTION_DESCRIPTION);
        return c;
    }

}
