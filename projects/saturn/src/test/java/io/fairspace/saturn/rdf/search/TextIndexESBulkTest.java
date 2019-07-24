package io.fairspace.saturn.rdf.search;

import org.apache.jena.graph.Node;
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
import org.elasticsearch.action.update.UpdateRequest;
import org.elasticsearch.client.Client;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;
import java.util.Map;
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
    public static final Node SUBJECT = createURI("http://example.com/s");
    public static final Node PREDICATE = createURI("http://example.com/p");
    public static final Node OBJECT = createURI("http://example.com/o");
    @Mock
    private TextIndexConfig config;

    @Mock
    private Client client;

    private EntityDefinition entityDefinition = new AutoEntityDefinition();

    @Mock
    private ActionFuture<BulkResponse> actionFuture;

    private TextIndex index;

    private volatile CountDownLatch latch;

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

        var thread1 = workerThread;
        workerThread = null;

        when(client.bulk(any())).thenAnswer(invocation -> actionFuture);
        update();
        commitAndWait();

        assertEquals(thread1, workerThread);
    }

    private void update() {
        latch = new CountDownLatch(1);
        dsg.begin(ReadWrite.WRITE);
        dsg.add(defaultGraphIRI, SUBJECT, PREDICATE, OBJECT);
        dsg.delete(defaultGraphIRI, SUBJECT, PREDICATE, OBJECT);
    }

    private void commitAndWait() throws InterruptedException {
        dsg.commit();
        assertTrue(latch.await(10, TimeUnit.SECONDS));

        verify(client, atLeastOnce()).bulk(argThat(bulkRequest ->
                bulkRequest.requests().size() == 2
                        && bulkRequest.requests().get(0) instanceof UpdateRequest
                        && bulkRequest.requests().get(0).id().equals(SUBJECT.getURI())
                        && ((UpdateRequest) bulkRequest.requests().get(0)).script().getParams().equals(
                                Map.of("field", PREDICATE.getLocalName(), "value", OBJECT.getURI()))
                        && ((UpdateRequest) bulkRequest.requests().get(0)).upsertRequest().sourceAsMap().equals(
                                Map.of(entityDefinition.getEntityField(), SUBJECT.getURI(),
                                        PREDICATE.getLocalName(), List.of(OBJECT.getURI())))
                        && bulkRequest.requests().get(1) instanceof UpdateRequest
                        && bulkRequest.requests().get(1).id().equals(SUBJECT.getURI())
                        && ((UpdateRequest) bulkRequest.requests().get(1)).script().getParams().equals(Map.of("field", PREDICATE.getLocalName(), "value", OBJECT.getURI()))
        ));

        verifyNoMoreInteractions(client);
    }
}