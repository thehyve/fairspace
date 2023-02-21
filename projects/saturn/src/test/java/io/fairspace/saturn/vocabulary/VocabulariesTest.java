package io.fairspace.saturn.vocabulary;

import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.shacl.Shapes;
import org.apache.jena.shacl.validation.ShaclPlainValidator;
import org.apache.jena.sparql.core.DatasetGraphFactory;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import static org.apache.jena.query.DatasetFactory.wrap;
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
        var dsg = DatasetGraphFactory.createTxnMem();
        Dataset ds = wrap(dsg);
        Model model = ds.getDefaultModel();
        var vocabulary = model.read("test-vocabulary.ttl");
        validate(vocabulary);
    }

    private void validate(Model dataModel) {
        var report = new ShaclPlainValidator().validate(Shapes.parse(SHACL_FOR_SHACL.getGraph()), dataModel.getGraph());
        if (!report.conforms()) {
            System.err.println("Validation errors:");
            report.getEntries().forEach(System.err::println);
        }
        assertTrue(report.conforms());
    }
}
