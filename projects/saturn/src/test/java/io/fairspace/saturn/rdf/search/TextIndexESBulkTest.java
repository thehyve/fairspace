package io.fairspace.saturn.rdf.search;

import org.apache.jena.query.ReadWrite;
import org.apache.jena.query.text.DatasetGraphText;
import org.apache.jena.query.text.EntityDefinition;
import org.apache.jena.query.text.TextIndex;
import org.apache.jena.query.text.TextIndexConfig;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetGraphFactory;
import org.elasticsearch.action.ActionFuture;
import org.elasticsearch.action.bulk.BulkItemResponse;
import org.elasticsearch.action.bulk.BulkResponse;
import org.elasticsearch.client.Client;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static java.lang.Thread.currentThread;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class TextIndexESBulkTest {
   @Mock
   private TextIndexConfig config;

   @Mock
    private Client client;

   private EntityDefinition entityDefinition = new AutoEntityDefinition();

   @Mock
   private ActionFuture<BulkResponse> actionFuture;

   private TextIndex index;

   private CountDownLatch latch;

   private volatile Thread workerThread;

   private DatasetGraph dsg;

   @Before
    public void before() throws ExecutionException, InterruptedException {
       when(config.getEntDef()).thenReturn(entityDefinition);
       when(client.bulk(any())).thenAnswer(invocation -> actionFuture);
       when(actionFuture.get()).thenAnswer(invocation -> {
           workerThread = currentThread();
           latch.countDown();
           return new BulkResponse(new BulkItemResponse[0], 1);
       });

       latch = new CountDownLatch(1);
       index = new TextIndexESBulk(config, client, "index");
       dsg = new DatasetGraphText(DatasetGraphFactory.createTxnMem(), index, new SingleTripleTextDocProducer(index, false));
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
       dsg.begin(ReadWrite.WRITE);
        dsg.add(defaultGraphIRI, createURI("http://example.com/s"), createURI("http://example.com/p"), createURI("http://example.com/o"));
    }

    private void commitAndWait() throws InterruptedException {
        dsg.commit();
        assertTrue(latch.await(10, TimeUnit.SECONDS));
    }
}