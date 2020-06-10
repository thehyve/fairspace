package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingFunction;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.sparql.JenaTransactionException;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.concurrent.CountDownLatch;

import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class BulkTransactionsTest {
    private static final Resource RESOURCE = createResource("http://example.com/1");
    private BulkTransactions txn = new BulkTransactions(createTxnMem());


    @Test(expected = JenaTransactionException.class)
    public void readToWritePromotionIsNotPossible() {
        txn.executeRead(ds1 -> txn.executeWrite(ds2 -> { }));
    }

    @Test
    public void writeToReadDemotionIsPossible() {
        txn.executeWrite(ds1 -> txn.executeRead(ds2 -> { }));
    }

    @Test
    public void tasksReturnResults() {
        assertEquals("blah", txn.calculateWrite(ds -> "blah"));
    }

    @Test(expected = IOException.class)
    public void tasksThrowExceptions() throws IOException {
        txn.calculateWrite(ds -> {
            throw new IOException();
        });
    }

    @Test
    public void nestedCallsAreAllowed() throws Exception {
        assertEquals("blah",  txn.calculateWrite(ds1 ->  txn.calculateWrite(ds2 ->  txn.calculateRead(ds3 -> "blah"))));
    }

    @Test
    public void onlySuccessfulTasksShouldBeCommitted() {
        batch(
                ds -> {
                    ds.getDefaultModel().add(RESOURCE, RDFS.label, "success");
                    txn.calculateWrite(ds2 -> ds.getDefaultModel().add(RESOURCE, RDFS.label, "nested"));
                    return null;
                },
                ds -> {
                    ds.getDefaultModel().add(RESOURCE, RDFS.label, "failed");
                    throw new RuntimeException();
                },
                ds -> {
                    ds.getDefaultModel().add(RESOURCE, RDFS.label, "aborted");
                    ds.getDefaultModel().abort();
                    return null;
                },
                ds -> ds.getDefaultModel().add(RESOURCE, RDFS.label, "another success")
        );

        txn.executeRead(ds -> {
            var model = ds.getDefaultModel();
            assertTrue(model.contains(RESOURCE, RDFS.label, "success"));
            assertTrue(model.contains(RESOURCE, RDFS.label, "nested"));
            assertFalse(model.contains(RESOURCE, RDFS.label, "failed"));
            assertFalse(model.contains(RESOURCE, RDFS.label, "aborted"));
            assertTrue(model.contains(RESOURCE, RDFS.label, "another success"));
        });

    }

    // executes actions in one batch
    private void batch(ThrowingFunction<Dataset, ?, ?>... jobs) {
        try {
            // First submit a long-running task to get other tasks batched
            var latch1 = new CountDownLatch(1);
            txn.calculateWrite(ds -> {
                latch1.countDown();
                Thread.sleep(500);
                return null;
            });

            latch1.await();

            var latch2 = new CountDownLatch(jobs.length);
            for (var job : jobs) {
                new Thread(() -> {
                    try {
                        txn.calculateWrite(job);
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