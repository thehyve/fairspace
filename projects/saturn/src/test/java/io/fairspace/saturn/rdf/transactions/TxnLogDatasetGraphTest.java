package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.ThreadContext;
import io.fairspace.saturn.services.users.User;
import org.apache.jena.rdf.model.Statement;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;

import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class TxnLogDatasetGraphTest {
    @Mock
    private TransactionLog log;
    private DatasetJobSupport ds;
    private static final Statement statement = createStatement(createResource("http://example.com/s1"),
            createProperty("http://example.com/p1"),
            createPlainLiteral("blah"));

    @Before
    public void before() {
        var user = new User();
        user.setIri(createURI("userId"));
        user.setName("fullName");
        setThreadContext(new ThreadContext(user, "project"));
        ds = new DatasetJobSupportImpl(new DatasetGraphBatch(new TxnLogDatasetGraph(createTxnMem(), log)));
    }


    @Test
    public void shouldLogWriteTransactions() throws IOException {
        ds.calculateWrite(() -> ds.getNamedModel("http://example.com/g1")
                .add(statement)
                .remove(statement));

        verify(log).onBegin();
        verify(log).onMetadata(eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onCommit();
        verifyNoMoreInteractions(log);
    }

    @Test
    public void shouldHandleAbortedTransactions() throws IOException {
        ds.executeWrite(() -> {
            ds.getNamedModel("http://example.com/g1")
                    .add(statement)
                    .remove(statement);
            ds.abort();
        });

        verify(log).onBegin();
        verify(log).onMetadata(eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onAbort();
        verifyNoMoreInteractions(log);
    }

    @Test
    public void shouldNotLogReadTransactions() throws IOException {
        ds.executeRead(() -> ds.getNamedModel("http://example.com/g1").listStatements().toList());

        verifyNoMoreInteractions(log);
    }

    @Test
    public void testThatAnExceptionWithinATransactionIsHandledProperly() throws IOException {
        try {
            ds.executeWrite(() -> {
                ds.getNamedModel("http://example.com/g1")
                        .add(statement)
                        .remove(statement);
                throw new RuntimeException();
            });
        } catch (Exception ignore) {
        }
        verify(log).onBegin();
        verify(log).onMetadata(eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onAbort();
    }
}