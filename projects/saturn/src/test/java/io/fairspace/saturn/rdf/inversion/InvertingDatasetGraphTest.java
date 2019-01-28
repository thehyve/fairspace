package io.fairspace.saturn.rdf.inversion;

import io.fairspace.saturn.rdf.Vocabulary;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.vocabulary.OWL;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static io.fairspace.saturn.rdf.Vocabulary.VOCABULARY_GRAPH;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class InvertingDatasetGraphTest {
    private static final Resource folder = createResource("http://example.com/folder");
    private static final Resource folder2 = createResource("http://example.com/folder2");
    private static final Resource file = createResource("http://example.com/file");
    private static final Property partOf = createProperty("http://fairspace.io/ontology#partOf");
    private static final Property hasPart = createProperty("http://fairspace.io/ontology#hasPart");
    private static final Property p1 = createProperty("http://examle.com/p1");
    private static final Property p2 = createProperty("http://examle.com/p2");
    private static final Property p3 = createProperty("http://examle.com/p3");

    private Dataset ds;

    @Before
    public void before() {
        DatasetGraph dsg = createTxnMem();
        Vocabulary.init(dsg);
        ds = DatasetFactory.wrap(new InvertingDatasetGraph(dsg));
        ds.begin(ReadWrite.WRITE);
    }

    @After
    public void after() {
        ds.abort();
    }

    @Test
    public void propertyInversionWorks() {
        Model m = ds.getDefaultModel();
        m.add(folder, hasPart, file);
        assertTrue(m.contains(folder, hasPart, file));
        assertTrue(m.contains(file, partOf, folder));

        m.remove(file, partOf, folder);
        assertFalse(m.contains(folder, hasPart, file));
        assertFalse(m.contains(file, partOf, folder));
    }

    @Test
    public void propertyInversionTakesVocabularyChangesIntoAccount() {
        Model vocabulary = ds.getNamedModel(VOCABULARY_GRAPH.getURI());
        vocabulary.add(p2, OWL.inverseOf, p1);

        Model m = ds.getDefaultModel();
        m.add(folder, p1, file);
        assertTrue(m.contains(folder, p1, file));
        assertTrue(m.contains(file, p2, folder));

        m.remove(file, p2, folder);
        assertFalse(m.contains(folder, p1, file));
        assertFalse(m.contains(file, p2, folder));

        vocabulary.remove(p2, OWL.inverseOf, p1);
        m.add(folder, p1, file);
        assertTrue(m.contains(folder, p1, file));
        assertFalse(m.contains(file, p2, folder));
    }

    @Test
    public void vocabularyChangesDoesntAffectStoredStatements() {
        Model vocabulary = ds.getNamedModel(VOCABULARY_GRAPH.getURI());
        vocabulary.add(p2, OWL.inverseOf, p1);

        Model m = ds.getDefaultModel();
        m.add(folder, p1, file);

        vocabulary.remove(p2, OWL.inverseOf, p1);

        // Vocabulary updates do not change the graph
        assertTrue(m.contains(folder, p1, file));
        assertTrue(m.contains(file, p2, folder));
        // Adding an existing statement does not remove any statements
        m.add(folder, p1, file);
        assertTrue(m.contains(folder, p1, file));
        assertTrue(m.contains(file, p2, folder));
    }

    @Test
    public void propertyCanBeInverseToItself() {
        Model vocabulary = ds.getNamedModel(VOCABULARY_GRAPH.getURI());
        vocabulary.add(p1, OWL.inverseOf, p1);

        Model m = ds.getDefaultModel();
        m.add(folder, p1, file);
        assertTrue(m.contains(folder, p1, file));
        assertTrue(m.contains(file, p1, folder));
    }

    @Test(expected = UnsupportedOperationException.class)
    public void propertyCannotHaveMultipleOpposites() {
        Model vocabulary = ds.getNamedModel(VOCABULARY_GRAPH.getURI());
        vocabulary.add(p1, OWL.inverseOf, p2);
        vocabulary.add(p1, OWL.inverseOf, p3);
    }

    @Test(expected = UnsupportedOperationException.class)
    public void checksMutualConsistency() {
        Model vocabulary = ds.getNamedModel(VOCABULARY_GRAPH.getURI());
        vocabulary.add(p1, OWL.inverseOf, p2);
        vocabulary.add(p3, OWL.inverseOf, p1);
    }
}