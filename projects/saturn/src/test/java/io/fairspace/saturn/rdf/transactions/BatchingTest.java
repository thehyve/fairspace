package io.fairspace.saturn.rdf.transactions;

import com.pivovarit.function.ThrowingSupplier;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Resource;
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
public class BatchingTest {
    private static final Resource RESOURCE = createResource("http://example.com/1");
    private DatasetJobSupport ds = new DatasetJobSupportInMemory();


    @Test
    public void tasksReturnResults() {
        assertEquals("blah", ds.calculateWrite(() -> "blah"));
    }

    @Test(expected = IOException.class)
    public void tasksThrowExceptions() throws IOException {
        ds.calculateWrite(() -> {
            throw new IOException();
        });
    }

    @Test
    public void nestedCallsAreAllowed() throws Exception {
        assertEquals("blah",  ds.calculateWrite(() ->  ds.calculateWrite(() ->  ds.calculateRead(() -> "blah"))));
    }

    @Test
    public void onlySuccessfulTasksShouldBeCommitted() {
        var model = ds.getDefaultModel();
        batch(
                () -> {
                    model.add(RESOURCE, RDFS.label, "success");
                    ds.calculateWrite(() -> model.add(RESOURCE, RDFS.label, "nested"));
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

        ds.executeRead(() -> {
            assertTrue(model.contains(RESOURCE, RDFS.label, "success"));
            assertTrue(model.contains(RESOURCE, RDFS.label, "nested"));
            assertFalse(model.contains(RESOURCE, RDFS.label, "failed"));
            assertFalse(model.contains(RESOURCE, RDFS.label, "aborted"));
            assertTrue(model.contains(RESOURCE, RDFS.label, "another success"));
        });

    }

    // executes actions in one batch
    private void batch(ThrowingSupplier<?, ?>... jobs) {
        try {
            // First submit a long-running task to get other tasks batched
            var latch1 = new CountDownLatch(1);
            ds.calculateWrite(() -> {
                latch1.countDown();
                Thread.sleep(500);
                return null;
            });

            latch1.await();

            var latch2 = new CountDownLatch(jobs.length);
            for (var job : jobs) {
                new Thread(() -> {
                    try {
                        ds.calculateWrite(job);
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