package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;

import static io.fairspace.saturn.rdf.Vocabulary.createVocabulary;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class VocabularyTest {
    private static final Node VOCABULARY_URI = createURI("http://fairspace.io/iri/vocabulary");
    private static final Resource resource1 = createResource("http://property1");
    private static final Resource resource2 = createResource("http://property2");
    private static final Resource resource3 = createResource("http://property3");
    private static final Resource unknownResource = createResource("http://unknown-resource.com");
    private static final Property machineOnly = createProperty("http://fairspace.io/ontology#machineOnly");

    private Vocabulary vocabulary;
    private Model vocabularyModel;
    private RDFConnectionLocal rdf;


    @Before
    public void setUp() {
        Dataset dataset = createTxnMem();
        rdf = new RDFConnectionLocal(dataset);

        vocabularyModel = dataset.getNamedModel(VOCABULARY_URI.getURI());
    }


    @Test
    public void testGetMachineOnlyPredicates() {
        setupVocabularyWithMachineOnlyPredicates();

        // Test method
        List<String> machineOnlyPredicates = vocabulary.getMachineOnlyPredicates();

        // Verify outcome
        assertEquals(1, machineOnlyPredicates.size());
        assertTrue(machineOnlyPredicates.contains(resource2.getURI()));
    }

    @Test
    public void testIsMachineOnlyPredicate() {
        setupVocabularyWithMachineOnlyPredicates();

        assertFalse(vocabulary.isMachineOnlyPredicate(resource1.getURI()));
        assertTrue(vocabulary.isMachineOnlyPredicate(resource2.getURI()));
        assertFalse(vocabulary.isMachineOnlyPredicate(resource3.getURI()));
        assertFalse(vocabulary.isMachineOnlyPredicate(unknownResource.getURI()));
    }

    @Test(expected = NullPointerException.class)
    public void testMachineOnlyPredicateFailsOnNull() {
        vocabulary.isMachineOnlyPredicate(null);
    }


    @Test
    public void testVocabularyInitialization() {
        assertTrue(vocabularyModel.isEmpty());

        vocabulary = createVocabulary(rdf, VOCABULARY_URI, "simple-vocabulary.jsonld");

        // Verify the model has been loaded into the vocabulary graph
        Resource classResource = createResource("http://www.w3.org/1999/02/22-rdf-syntax-ns#Class");
        assertTrue(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Collection"), RDF.type, classResource));
        assertTrue(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Directory"), RDF.type, classResource));
    }

    @Test
    public void testVocabularyInitializationIsNoopWhenVocabularyAlreadyExists() {
        vocabularyModel.add(createResource("http://some-data"), RDF.type, RDF.Property);

        vocabulary = createVocabulary(rdf, VOCABULARY_URI, "simple-vocabulary.jsonld");

        // Verify the model has not been loaded into the vocabulary graph
        assertFalse(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Collection"), RDF.type, "http://www.w3.org/1999/02/22-rdf-syntax-ns#Class"));
        assertTrue(vocabularyModel.isIsomorphicWith(ModelFactory.createDefaultModel().add(createResource("http://some-data"), RDF.type, RDF.Property)));
    }

    private void setupVocabularyWithMachineOnlyPredicates() {
        vocabulary = createVocabulary(rdf, VOCABULARY_URI, "empty-vocabulary.jsonld");

        // Setup model
        vocabularyModel.add(resource1, RDF.type, RDF.Property);
        vocabularyModel.add(resource2, RDF.type, RDF.Property);
        vocabularyModel.add(resource3, RDF.type, RDF.Property);

        vocabularyModel.add(resource1, machineOnly, createTypedLiteral(false));
        vocabularyModel.add(resource2, machineOnly, createTypedLiteral(true));
    }

}
