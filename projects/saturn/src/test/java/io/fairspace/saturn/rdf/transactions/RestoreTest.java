package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.Config;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Statement;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeRead;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class RestoreTest {
    private static final Node vocabularyGraph = createURI("http://example.com");

    private final Statement stmt1 = createStatement(createResource("http://example.com/subject1"),
            createProperty("http://example.com/property1"),
            createResource("http://example.com/object1"));
    private final Statement stmt2 = createStatement(createResource("http://example.com/subject2"),
            createProperty("http://example.com/property2"),
            createResource("http://example.com/object2"));

    private Config.Jena config;

    @Before
    public void before() {
        config = new Config.Jena();
        config.elasticSearch.required = false;
        config.datasetPath = new File(getTempDirectory(), randomUUID().toString());
        config.transactionLogPath = new File(getTempDirectory(), randomUUID().toString());
    }

    @After
    public void after() {
        config.transactionLogPath.delete();
        config.datasetPath.delete();
    }

    @Test
    public void restoreWorksAsExpected() throws IOException {
        var ds1 = SaturnDatasetFactory.connect(config, vocabularyGraph);

        executeWrite(ds1, () -> ds1.getDefaultModel().add(stmt1));
        executeWrite(ds1, () -> ds1.getDefaultModel().add(stmt2));

        ds1.close();

        deleteDirectory(config.datasetPath);
        assertFalse(config.datasetPath.exists());


        var ds2 = SaturnDatasetFactory.connect(config, vocabularyGraph);

        try {
            executeRead(ds2, () -> {
                assertTrue(ds2.getDefaultModel().contains(stmt1));
                assertTrue(ds2.getDefaultModel().contains(stmt2));
            });
        } finally {
            ds2.close();
        }
    }
}
