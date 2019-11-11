package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDFS;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;

import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.system.Txn.executeRead;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class TxnLogDatasetGraphBatchedTest {
    public static final Resource RESOURCE = createResource("http://example.com/1");
    private Dataset ds = createTxnMem();
    private TxnLogDatasetGraphBatched dsg;

    @Mock
    private TransactionLog txnLog;

    @Before
    public void before() {
        dsg = new TxnLogDatasetGraphBatched(ds.asDatasetGraph(), txnLog);
    }

    @After
    public void after() {
        dsg.close();
    }

    @Test
    public void tasksReturnResults() {
        assertEquals("blah", dsg.write(() -> "blah"));
    }

    @Test(expected = IOException.class)
    public void tasksThrowExceptions() throws IOException {
        dsg.write(() -> {
            throw new IOException();
        });
    }

    @Test
    public void nestedCallsAreAllowed() {
        try {
            assertEquals("blah", dsg.write(() -> dsg.write(() -> dsg.write(() -> "blah"))));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Test
    public void onlySuccessfulTasksShouldBeCommitted() {
        var model = ds.getDefaultModel();
        batch(
                () -> {
                    model.add(RESOURCE, RDFS.label, "success");
                    dsg.write(() -> model.add(RESOURCE, RDFS.label, "nested"));
                    return null;
                },
                () -> {
                    model.add(RESOURCE, RDFS.label, "failed");
                    throw new RuntimeException();
                },
                () -> {
                    model.add(RESOURCE, RDFS.label, "aborted");
                    model.abort();
                    return null;
                },
                () -> model.add(RESOURCE, RDFS.label, "another success")
        );

        executeRead(ds, () -> {
            assertTrue(model.contains(RESOURCE, RDFS.label, "success"));
            assertTrue(model.contains(RESOURCE, RDFS.label, "nested"));
            assertFalse(model.contains(RESOURCE, RDFS.label, "failed"));
            assertFalse(model.contains(RESOURCE, RDFS.label, "aborted"));
            assertTrue(model.contains(RESOURCE, RDFS.label, "another success"));
        });

    }

    // executes actions in one batch
    private void batch(ThrowingSupplier<?, ?>... actions) {
        try {
            // First submit a long-running task to get other tasks batched
            var latch1 = new CountDownLatch(1);
            dsg.write(() -> {
                latch1.countDown();
                Thread.sleep(500);
                return null;
            });

            latch1.await();

            var latch2 = new CountDownLatch(actions.length);
            for (var action : actions) {
                new Thread(() -> {
                    try {
                        dsg.write(action);
                    } catch (Exception ignore) {
                    } finally {
                        latch2.countDown();
                    }
                }).start();
            }
            latch2.await();
        } catch (InterruptedException ignore) {
        }
    }
}