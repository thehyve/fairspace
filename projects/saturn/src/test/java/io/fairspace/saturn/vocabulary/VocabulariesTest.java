package io.fairspace.saturn.vocabulary;

import io.fairspace.saturn.services.metadata.validation.ValidationResult;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.util.FileManager;
import org.junit.Test;
import org.topbraid.shacl.vocabulary.SH;

import java.util.List;

import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getValidationResult;
import static io.fairspace.saturn.vocabulary.Vocabularies.META_VOCABULARY;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class VocabulariesTest {
    private static final Model SHACL_FOR_SHACL = FileManager.get().loadModel("default-vocabularies/shacl-shacl.ttl");

    private final Dataset ds = DatasetFactory.create();
    private final Vocabularies vocabularies = new Vocabularies(new RDFConnectionLocal(ds));

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
        engine.validateAll();
        assertEquals(ValidationResult.VALID, getValidationResult(engine));
    }
}
