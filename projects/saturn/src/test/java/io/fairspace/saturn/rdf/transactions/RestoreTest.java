package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Statement;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeRead;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.*;

public class RestoreTest {
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
        config.elasticSearch.enabled = false;
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
        var ds1 = newDataset();

        executeWrite(ds1, () -> ds1.getDefaultModel().add(stmt1));
        executeWrite(ds1, () -> ds1.getDefaultModel().add(stmt2));

        ds1.close();

        deleteDirectory(config.datasetPath);
        assertFalse(config.datasetPath.exists());


        var ds2 = newDataset();

        try {
            executeRead(ds2, () -> {
                assertTrue(ds2.getDefaultModel().contains(stmt1));
                assertTrue(ds2.getDefaultModel().contains(stmt2));
            });
        } finally {
            ds2.close();
        }
    }

    @Test
    public void restoreListsWorksAsExpected() throws IOException {
        var m = createDefaultModel();
        m.add(createResource("http://example.com/1"), createProperty("http://example.com/items"), m.createList(createTypedLiteral(1), createTypedLiteral(2)));
        m.add(createResource("http://example.com/2"), createProperty("http://example.com/children"), m.createList(createTypedLiteral("a"), createTypedLiteral("b")));

        var ds1 = newDataset();
        executeWrite(ds1, () -> ds1.getDefaultModel().add(m));

        ds1.close();

        deleteDirectory(config.datasetPath);

        var ds2 = newDataset();

        try {
            executeRead(ds2, () -> assertEquals(m.listStatements().toSet(), ds2.getDefaultModel().listStatements().toSet()));
        } finally {
            ds2.close();
        }
    }

    private Dataset newDataset() throws IOException {
        return DatasetFactory.wrap(SaturnDatasetFactory.connect(config, "ds", () -> null));
    }
}
