package io.fairspace.saturn.rdf.transactions;

import java.io.File;
import java.io.IOException;

import org.apache.jena.rdf.model.Statement;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class RestoreTest {
    private final Statement stmt1 = createStatement(
            createResource("http://example.com/subject1"),
            createProperty("http://example.com/property1"),
            createResource("http://example.com/object1"));
    private final Statement stmt2 = createStatement(
            createResource("http://example.com/subject2"),
            createProperty("http://example.com/property2"),
            createResource("http://example.com/object2"));

    private Config.Jena config;

    @Before
    public void before() {
        config = new Config.Jena();
        config.datasetPath = new File(getTempDirectory(), randomUUID().toString());
        config.transactionLogPath = new File(getTempDirectory(), randomUUID().toString());
    }

    @After
    public void after() {
        config.transactionLogPath.delete();
        config.datasetPath.delete();
    }

    @Test
    public void restoreWorksAsExpected() throws Exception {
        try (var txn1 = newDataset()) {

            txn1.executeWrite(m -> m.add(stmt1));
            txn1.executeWrite(m -> m.add(stmt2));
        }

        deleteDirectory(config.datasetPath);
        assertFalse(config.datasetPath.exists());

        try (var txn2 = newDataset()) {
            txn2.executeRead(m -> {
                assertTrue(m.contains(stmt1));
                assertTrue(m.contains(stmt2));
            });
        }
    }

    @Test
    public void restoreListsWorksAsExpected() throws Exception {
        var txn1 = newDataset();
        txn1.executeWrite(m -> m.add(
                        createResource("http://example.com/1"),
                        createProperty("http://example.com/items"),
                        m.createList(createTypedLiteral(1), createTypedLiteral(2)))
                .add(
                        createResource("http://example.com/2"),
                        createProperty("http://example.com/children"),
                        m.createList(createTypedLiteral("a"), createTypedLiteral("b"))));

        var before = txn1.calculateRead(m -> m.listStatements().toSet());

        txn1.close();

        deleteDirectory(config.datasetPath);

        try (var txn2 = newDataset()) {
            txn2.executeRead(m -> assertEquals(before, m.listStatements().toSet()));
        }
    }

    private Transactions newDataset() throws IOException {
        return new BulkTransactions(SaturnDatasetFactory.connect(config, null));
    }
}
