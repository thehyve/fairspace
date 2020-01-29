package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.ThreadContext;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.rdf.DatasetGraphMulti;
import org.apache.jena.rdf.model.Statement;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static java.util.UUID.randomUUID;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class RestoreTest {
    private final Statement stmt1 = createStatement(createResource("http://example.com/subject1"),
            createProperty("http://example.com/property1"),
            createResource("http://example.com/object1"));
    private final Statement stmt2 = createStatement(createResource("http://example.com/subject2"),
            createProperty("http://example.com/property2"),
            createResource("http://example.com/object2"));

    private Config config;

    @Before
    public void before() {
        config = new Config();
        config.jena.elasticSearch.enabled = false;
        config.jena.datasetPath = new File(getTempDirectory(), randomUUID().toString());
        config.jena.transactionLogPath = new File(getTempDirectory(), randomUUID().toString());

        setThreadContext(new ThreadContext());
        getThreadContext().setProject("ds");
    }

    @After
    public void after() {
        config.jena.transactionLogPath.delete();
        config.jena.datasetPath.delete();
    }

    @Test
    public void restoreWorksAsExpected() throws IOException {
        var ds1 = newDataset();

        ds1.executeWrite(() -> ds1.getDefaultModel().add(stmt1));
        ds1.executeWrite(() -> ds1.getDefaultModel().add(stmt2));

        ds1.close();

        deleteDirectory(config.jena.datasetPath);
        assertFalse(config.jena.datasetPath.exists());

        var ds2 = newDataset();

        try {
            ds2.executeRead(() -> {
                assertTrue(ds2.getDefaultModel().contains(stmt1));
                assertTrue(ds2.getDefaultModel().contains(stmt2));
            });
        } finally {
            ds2.close();
        }
    }

    @Test
    public void restoreListsWorksAsExpected() throws IOException {
        var ds1 = newDataset();
        ds1.executeWrite(() -> ds1.getDefaultModel()
                .add(createResource("http://example.com/1"), createProperty("http://example.com/items"), ds1.getDefaultModel().createList(createTypedLiteral(1), createTypedLiteral(2)))
                .add(createResource("http://example.com/2"), createProperty("http://example.com/children"), ds1.getDefaultModel().createList(createTypedLiteral("a"), createTypedLiteral("b"))));

        var before  = ds1.calculateRead(() -> ds1.getDefaultModel().listStatements().toSet());

        ds1.close();

        deleteDirectory(config.jena.datasetPath);

        var ds2 = newDataset();

        try {
            ds2.executeRead(() -> assertEquals(before, ds2.getDefaultModel().listStatements().toSet()));
        } finally {
            ds2.close();
        }
    }

    private DatasetJobSupport newDataset() {
        return new DatasetJobSupportImpl(new DatasetGraphMulti(config));
    }
}
