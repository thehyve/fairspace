package io.fairspace.saturn.vocabulary;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.validation.ShaclSimpleValidator;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.vocabulary.Vocabularies.*;
import static org.apache.jena.riot.RDFDataMgr.loadModel;
import static org.junit.Assert.assertTrue;

@RunWith(MockitoJUnitRunner.class)
public class VocabulariesTest {
    private static final Model SHACL_FOR_SHACL = loadModel("std/shacl-shacl.ttl");

    private final Dataset ds = DatasetFactory.create();


    @Before
    public void setUp() {
    }

    @Test
    public void validateVocabulary() {
        validate(VOCABULARY, SHACL_FOR_SHACL);
    }

    private void validate(Model dataModel, Model shapesModel) {
        var report = new ShaclSimpleValidator().validate(Shapes.parse(shapesModel.getGraph()), dataModel.getGraph());
        if (!report.conforms()) {
            System.err.println("Validation errors:");
            report.getEntries().forEach(System.err::println);
        }
        assertTrue(report.conforms());
    }
}
