package io.fairspace.saturn.vocabulary;

import io.fairspace.saturn.services.metadata.validation.ViolationHandler;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.util.FileManager;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.topbraid.shacl.vocabulary.SH;

import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.generateVocabularyIri;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getViolations;
import static io.fairspace.saturn.vocabulary.Vocabularies.*;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class VocabulariesTest {
    private static final Model SHACL_FOR_SHACL = FileManager.get().loadModel("default-vocabularies/shacl-shacl.ttl");

    private final Dataset ds = DatasetFactory.create();
    private final RDFConnection rdf = new RDFConnectionLocal(ds);

    private ViolationHandler violationHandler;
    private boolean isValid = true;

    @Before
    public void setUp() {
        initVocabularies(rdf);
        isValid = true;

        violationHandler = (message, subject, predicate, object) -> {
            isValid = false;
            System.err.println(String.format("%s - { %s %s %s }", message, subject, predicate, object));
        };
    }

    @Test
    public void validateMetaVocabulary() throws InterruptedException {
        validate(META_VOCABULARY, SHACL_FOR_SHACL);
    }

    @Test
    public void validateVocabulary() throws InterruptedException {
        validate(ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI()), META_VOCABULARY.union(SHACL_FOR_SHACL));
    }

    @Test
    public void testGetMachineOnlyPredicates() {
        var graph = createURI("http://example.com/graph");
        var model = ds.getNamedModel(graph.getURI());

        assertTrue(getMachineOnlyPredicates(rdf, graph).isEmpty());

        var shape1 = createResource("http://example.com/s1");
        var shape2 = createResource("http://example.com/s2");

        var property1 = createResource("http://example.com/p1");
        var property2 = createResource("http://example.com/p2");
        model.add(shape1, SH.path, property1);
        model.add(shape2, SH.path, property2);
        model.add(shape1, FS.machineOnly, createTypedLiteral(true));

        assertEquals(Set.of(property1.getURI()), getMachineOnlyPredicates(rdf, graph));
    }

    private void validate(Model dataModel, Model shapesModel) throws InterruptedException {
        var engine = createEngine(dataModel, shapesModel);
        engine.validateAll();
        getViolations(engine, violationHandler);
        assertTrue(isValid);
    }

    @Test
    public void testGetInverseProperty() {
        var provideMaterial = createProperty(generateVocabularyIri("providesMaterial").getURI());
        var derivesFrom = createProperty(generateVocabularyIri("derivesFrom").getURI());
        var unknown = createProperty(generateVocabularyIri("unknown").getURI());

        assertEquals(provideMaterial, getInverse(rdf, VOCABULARY_GRAPH_URI, derivesFrom));
        assertEquals(derivesFrom, getInverse(rdf, VOCABULARY_GRAPH_URI, provideMaterial));
        assertNull(getInverse(rdf, VOCABULARY_GRAPH_URI, unknown));

        assertEquals(FS.inverseRelation, getInverse(rdf, META_VOCABULARY_GRAPH_URI, FS.inverseRelation));
    }
}
