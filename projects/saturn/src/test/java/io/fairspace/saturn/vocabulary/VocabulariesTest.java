package io.fairspace.saturn.vocabulary;

import io.fairspace.saturn.rdf.transactions.RDFLinkSimple;
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

import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.createEngine;
import static io.fairspace.saturn.services.metadata.validation.ShaclUtil.getViolations;
import static io.fairspace.saturn.vocabulary.Vocabularies.*;
import static org.junit.Assert.assertTrue;

@RunWith(MockitoJUnitRunner.class)
public class VocabulariesTest {
    private static final Model SHACL_FOR_SHACL = FileManager.get().loadModel("default-vocabularies/shacl-shacl.ttl");

    private final Dataset ds = DatasetFactory.create();
    private final RDFConnection rdf = new RDFConnectionLocal(ds);

    private ViolationHandler violationHandler;
    private boolean isValid = true;

    @Before
    public void setUp() {
        initVocabularies(new RDFLinkSimple(rdf));
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

    private void validate(Model dataModel, Model shapesModel) throws InterruptedException {
        var engine = createEngine(dataModel, shapesModel);
        engine.validateAll();
        getViolations(engine, violationHandler);
        assertTrue(isValid);
    }
}
