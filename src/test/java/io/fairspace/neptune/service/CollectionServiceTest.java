package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Collection;
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
import static org.mockito.ArgumentMatchers.matches;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
        Collection c = getCollection();

        collectionService.createCollection(c);

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
        Collection c = new Collection();
        c.setUri(COLLECTION_URI);
        c.setName(COLLECTION_NAME);

        collectionService.createCollection(c);

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
        Collection c = new Collection();
        c.setUri(COLLECTION_URI);
        c.setDescription(COLLECTION_DESCRIPTION);

        collectionService.createCollection(c);
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

        List<Collection> collections = collectionService.getCollections();

        assertEquals(1, collections.size());
        assertEquals(COLLECTION_URI, collections.get(0).getUri());
        assertEquals(COLLECTION_NAME, collections.get(0).getName());
        assertEquals(COLLECTION_DESCRIPTION, collections.get(0).getDescription());
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableName() {
        Collection c = getCollection();

        collectionService.createCollection(c);

        c.setDescription(null);
        c.setName(COLLECTION_NAME + "test");

        collectionService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 1
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.name,
                        m.createLiteral(c.getName()))));
    }

    @Test
    public void collectionsWithPropertiesShouldHavePatchableDescription() {
        Collection c = getCollection();

        collectionService.createCollection(c);

        c.setName(null);
        c.setDescription(COLLECTION_DESCRIPTION + "test");

        collectionService.patchCollection(c);

        verify(tripleService, times(1))
                .patchTriples(argThat(m -> m.size() == 1
                        && m.contains(
                        m.createResource(COLLECTION_URI),
                        Fairspace.description,
                        m.createLiteral(c.getDescription()))));
    }

    @Test
    public void collectionsWithPropertiesShouldBeAbleToPatchBoth() {
        Collection c = getCollection();

        collectionService.createCollection(c);

        c.setName(COLLECTION_NAME + "test");
        c.setDescription(COLLECTION_DESCRIPTION + "test");

        collectionService.patchCollection(c);

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
        Collection c = getCollection();

        collectionService.createCollection(c);

        c.setName(null);
        c.setDescription(null);

        collectionService.patchCollection(c);

        verify(tripleService, times(1)).patchTriples(argThat(Model::isEmpty));
    }

    private Collection getCollection() {
        Collection c = new Collection();
        c.setUri(COLLECTION_URI);
        c.setName(COLLECTION_NAME);
        c.setDescription(COLLECTION_DESCRIPTION);
        return c;
    }

}
