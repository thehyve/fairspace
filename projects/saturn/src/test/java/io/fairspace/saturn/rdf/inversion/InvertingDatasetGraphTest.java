package io.fairspace.saturn.rdf.inversion;

import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.vocabulary.OWL;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static io.fairspace.saturn.rdf.Vocabulary.initializeVocabulary;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class InvertingDatasetGraphTest {
    private static final Node vocabularyGraph = createURI("http://example.com");
    private static final Resource person = createResource("http://example.com/person");
    private static final Resource material = createResource("http://example.com/material");
    private static final Property derivesFrom = createProperty("http://fairspace.io/ontology#derivesFrom");
    private static final Property providesMaterial = createProperty("http://fairspace.io/ontology#providesMaterial");
    private static final Property p1 = createProperty("http://examle.com/p1");
    private static final Property p2 = createProperty("http://examle.com/p2");
    private static final Property p3 = createProperty("http://examle.com/p3");

    private Dataset ds;

    @Before
    public void before() {
        DatasetGraph dsg = createTxnMem();
        ds = DatasetFactory.wrap(new InvertingDatasetGraph(dsg, vocabularyGraph));
        initializeVocabulary(new RDFConnectionLocal(ds), vocabularyGraph, "test-vocabulary.jsonld");

        ds.begin(ReadWrite.WRITE);
    }

    @After
    public void after() {
        ds.abort();
    }

    @Test
    public void propertyInversionWorks() {
        Model m = ds.getDefaultModel();
        m.add(person, providesMaterial, material);
        assertTrue(m.contains(person, providesMaterial, material));
        assertTrue(m.contains(material, derivesFrom, person));

        m.remove(material, derivesFrom, person);
        assertFalse(m.contains(person, providesMaterial, material));
        assertFalse(m.contains(material, derivesFrom, person));
    }

    @Test
    public void propertyInversionTakesVocabularyChangesIntoAccount() {
        Model vocabulary = ds.getNamedModel(vocabularyGraph.getURI());
        vocabulary.add(p2, OWL.inverseOf, p1);

        Model m = ds.getDefaultModel();
        m.add(person, p1, material);
        assertTrue(m.contains(person, p1, material));
        assertTrue(m.contains(material, p2, person));

        m.remove(material, p2, person);
        assertFalse(m.contains(person, p1, material));
        assertFalse(m.contains(material, p2, person));

        vocabulary.remove(p2, OWL.inverseOf, p1);
        m.add(person, p1, material);
        assertTrue(m.contains(person, p1, material));
        assertFalse(m.contains(material, p2, person));
    }

    @Test
    public void vocabularyChangesDoesntAffectStoredStatements() {
        Model vocabulary = ds.getNamedModel(vocabularyGraph.getURI());
        vocabulary.add(p2, OWL.inverseOf, p1);

        Model m = ds.getDefaultModel();
        m.add(person, p1, material);

        vocabulary.remove(p2, OWL.inverseOf, p1);

        // Vocabulary updates do not onChange the graph
        assertTrue(m.contains(person, p1, material));
        assertTrue(m.contains(material, p2, person));
        // Adding an existing statement does not remove any statements
        m.add(person, p1, material);
        assertTrue(m.contains(person, p1, material));
        assertTrue(m.contains(material, p2, person));
    }

    @Test
    public void propertyCanBeInverseToItself() {
        Model vocabulary = ds.getNamedModel(vocabularyGraph.getURI());
        vocabulary.add(p1, OWL.inverseOf, p1);

        Model m = ds.getDefaultModel();
        m.add(person, p1, material);
        assertTrue(m.contains(person, p1, material));
        assertTrue(m.contains(material, p1, person));
    }

    @Test(expected = UnsupportedOperationException.class)
    public void propertyCannotHaveMultipleOpposites() {
        Model vocabulary = ds.getNamedModel(vocabularyGraph.getURI());
        vocabulary.add(p1, OWL.inverseOf, p2);
        vocabulary.add(p1, OWL.inverseOf, p3);
    }

    @Test(expected = UnsupportedOperationException.class)
    public void checksMutualConsistency() {
        Model vocabulary = ds.getNamedModel(vocabularyGraph.getURI());
        vocabulary.add(p1, OWL.inverseOf, p2);
        vocabulary.add(p3, OWL.inverseOf, p1);
    }
}
