package io.fairspace.saturn.rdf;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.OWL;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class VocabularyTest {
    private static final Node VOCABULARY_URI = createURI("http://localhost/iri/vocabulary");
    private static final Resource resource1 = createResource("http://property1");
    private static final Resource resource2 = createResource("http://property2");
    private static final Resource resource3 = createResource("http://property3");
    private static final Resource shape1 = createResource("http://shape1");
    private static final Resource shape2 = createResource("http://shape2");
    private static final Resource shape3 = createResource("http://shape3");
    private static final Resource unknownResource = createResource("http://unknown-resource.com");
    private static final Property machineOnly = createProperty("http://fairspace.io/ontology#machineOnly");
    private static final Resource CLASS_RESOURCE = createResource("http://www.w3.org/1999/02/22-rdf-syntax-ns#Class");
    private static final Property SHACL_PATH = createProperty("http://www.w3.org/ns/shacl#path");

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
    public void testVocabularyInitialization() {
        assertTrue(vocabularyModel.isEmpty());

        vocabulary = Vocabulary.initializeVocabulary(rdf, VOCABULARY_URI, "simple-vocabulary.jsonld");

        // Verify the model has been loaded into the vocabulary graph
        assertTrue(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Collection"), RDF.type, CLASS_RESOURCE));
        assertTrue(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Directory"), RDF.type, CLASS_RESOURCE));
    }

    @Test
    public void testVocabularyInitializationIsNoopWhenVocabularyAlreadyExists() {
        vocabularyModel.add(createResource("http://some-data"), RDF.type, RDF.Property);

        vocabulary = Vocabulary.initializeVocabulary(rdf, VOCABULARY_URI, "simple-vocabulary.jsonld");

        // Verify the model has not been loaded into the vocabulary graph
        assertFalse(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Collection"), RDF.type, CLASS_RESOURCE));
        assertTrue(vocabularyModel.isIsomorphicWith(ModelFactory.createDefaultModel().add(createResource("http://some-data"), RDF.type, RDF.Property)));
    }

    @Test
    public void testVocabularyRecreation() {
        vocabulary = Vocabulary.recreateVocabulary(rdf, VOCABULARY_URI, "simple-vocabulary.jsonld");

        // Verify the model has been loaded into the vocabulary graph
        assertTrue(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Collection"), RDF.type, CLASS_RESOURCE));
        assertTrue(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Directory"), RDF.type, CLASS_RESOURCE));
    }

    @Test
    public void testVocabularyRecreationWhenVocabularyAlreadyExists() {
        vocabularyModel.add(createResource("http://some-data"), RDF.type, RDF.Property);

        vocabulary = Vocabulary.recreateVocabulary(rdf, VOCABULARY_URI, "simple-vocabulary.jsonld");

        // Verify the model has not been loaded into the vocabulary graph
        assertTrue(vocabularyModel.contains(createResource("http://fairspace.io/ontology#Collection"), RDF.type, CLASS_RESOURCE));
        assertFalse(vocabularyModel.contains(createResource("http://some-data"), RDF.type, RDF.Property));
    }

    @Test
    public void testIsInvertiblePredicate() {
        var property1 = createProperty("http://example.com/property1");
        var property2 = createProperty("http://example.com/property2");
        var property3 = createProperty("http://example.com/property3");

        vocabularyModel
                .add(property1, RDF.type, RDF.Property)
                .add(property2, RDF.type, RDF.Property)
                .add(property3, RDF.type, RDF.Property)
                .add(property1, OWL.inverseOf, property2)
                .add(property2, OWL.inverseOf, property1);

        vocabulary = Vocabulary.initializeVocabulary(rdf, VOCABULARY_URI, "empty-vocabulary.jsonld");

        assertTrue(vocabulary.isInvertiblePredicate(property1.getURI()));
        assertTrue(vocabulary.isInvertiblePredicate(property2.getURI()));
        assertFalse(vocabulary.isInvertiblePredicate(property3.getURI()));
    }

    private void setupVocabularyWithMachineOnlyPredicates() {
        vocabulary = Vocabulary.initializeVocabulary(rdf, VOCABULARY_URI, "empty-vocabulary.jsonld");

        // Setup model
        vocabularyModel.add(shape1, SHACL_PATH, resource1);
        vocabularyModel.add(shape2, SHACL_PATH, resource2);
        vocabularyModel.add(shape3, SHACL_PATH, resource3);

        vocabularyModel.add(shape1, machineOnly, createTypedLiteral(false));
        vocabularyModel.add(shape2, machineOnly, createTypedLiteral(true));
    }

}
