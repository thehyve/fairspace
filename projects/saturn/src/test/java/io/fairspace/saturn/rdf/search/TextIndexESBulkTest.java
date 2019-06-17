package io.fairspace.saturn.rdf.search;

import org.apache.jena.query.text.Entity;
import org.apache.jena.query.text.EntityDefinition;
import org.apache.jena.query.text.TextIndex;
import org.apache.jena.query.text.TextIndexConfig;
import org.elasticsearch.action.ActionFuture;
import org.elasticsearch.action.bulk.BulkItemResponse;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.client.Client;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static java.lang.Thread.currentThread;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class TextIndexESBulkTest {
   @Mock
   private TextIndexConfig config;

   @Mock
    private Client client;

   @Mock
   private EntityDefinition entityDefinition;

   @Mock
   private ActionFuture<BulkResponse> actionFuture;

   private TextIndex index;

   private CountDownLatch latch;

   private volatile Thread workerThread;

   @Before
    public void before() throws ExecutionException, InterruptedException {
       when(config.getEntDef()).thenReturn(entityDefinition);
       when(entityDefinition.fields()).thenReturn(List.of("field1"));
       when(client.bulk(any())).thenAnswer(invocation -> actionFuture);
       when(actionFuture.get()).thenAnswer(invocation -> {
           workerThread = currentThread();
           latch.countDown();
           return new BulkResponse(new BulkItemResponse[0], 1);
       });

       latch = new CountDownLatch(1);
       index = new TextIndexESBulk(config, client, "index");

   }

    @Test
    public void noInteractionsWithESBeforeCommit() throws InterruptedException, ExecutionException {
        update();
        verifyZeroInteractions(client, actionFuture);
    }

   @Test
   public void bulkUpdatesAreSentOnCommit() throws InterruptedException, ExecutionException {
       update();
       commitAndWait();

       verify(client).bulk(any());
       verify(actionFuture).get();
   }


    @Test
    public void bulkUpdatesAreSentInASeparateWorkerThread() throws InterruptedException, ExecutionException {
        update();
        commitAndWait();

        assertNotNull(workerThread);
        assertNotEquals(currentThread(), workerThread);
    }

    @Test
    public void sameThreadForAllUpdates() throws InterruptedException, ExecutionException {
        update();
        commitAndWait();

        var thread1= workerThread;

        update();
        commitAndWait();

        assertEquals(thread1, workerThread);
    }

    private void update() {
        var entity1 = new Entity("http://example.com/123", "graph");
        entity1.put("field1", "1");
        index.addEntity(entity1);
    }

    private void commitAndWait() throws InterruptedException {
        index.commit();
        assertTrue(latch.await(10, TimeUnit.SECONDS));
    }
}