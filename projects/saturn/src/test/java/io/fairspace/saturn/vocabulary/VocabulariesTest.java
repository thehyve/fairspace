package io.fairspace.saturn.vocabulary;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import java.util.List;

import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.topbraid.shacl.util.SHACL2SPINBridge.createConstraintViolations;

public class VocabulariesTest {
    private final Dataset ds = DatasetFactory.create();
    private Vocabularies vocabularies = new Vocabularies(new RDFConnectionLocal(ds));

    @Test
    public void validateMetaVocabulary() throws InterruptedException {
        validate(META_VOCABULARY, createDefaultModel()); // Validates against SHACL spec
    }

    @Test
    public void validateVocabulary() throws InterruptedException {
        validate(ds.getNamedModel(VOCABULARY_GRAPH_URI.getURI()), META_VOCABULARY);
    }

    @Test
    public void testGetMachineOnlyPredicates() {
        var graph = createURI("http://example.com/graph");
        var model = ds.getNamedModel(graph.getURI());

        assertTrue(vocabularies.getMachineOnlyPredicates(graph).isEmpty());

        var shape1 = createResource("http://example.com/s1");
        var shape2 = createResource("http://example.com/s2");

        var property1 = createResource("http://example.com/p1");
        var property2 = createResource("http://example.com/p2");
        model.add(shape1, SH.path, property1);
        model.add(shape2, SH.path, property2);
        model.add(shape1, FS.machineOnly, createTypedLiteral(true));

        assertEquals(List.of(property1.getURI()), vocabularies.getMachineOnlyPredicates(graph));
    }

    private void validate(Model dataModel, Model shapesModel) throws InterruptedException {
        var engine = createEngine(dataModel, shapesModel);
        var report = engine.validateAll();
        var violations = createConstraintViolations(report.getModel());
        assertTrue(violations.isEmpty());
    }
}