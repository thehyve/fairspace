package io.fairspace.saturn.rdf.transactions;

import io.fairspace.saturn.auth.UserInfo;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.rdf.model.Statement;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;
import static org.apache.jena.system.Txn.executeWrite;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class TxnLogDatasetGraphTest {

    @Mock
    private TransactionLog log;
    private Dataset ds;
    private static final Statement statement = createStatement(createResource("http://example.com/s1"),
            createProperty("http://example.com/p1"),
            createPlainLiteral("blah"));

    @Before
    public void before() {
        ds = DatasetFactory.wrap(new TxnLogDatasetGraph(createTxnMem(), log,
                () -> new UserInfo("userId", "userName", "fullName", null),
                () -> "message"));
    }


    @Test
    public void shouldLogNonEmptyWriteTransactions() throws IOException {
        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1")
                .add(statement)
                .remove(statement));

        verify(log).onBegin(eq("message"), eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onCommit();
    }

    @Test
    public void shouldHandleAbortedTransactions() throws IOException {
        ds.begin(ReadWrite.WRITE);
        ds.getNamedModel("http://example.com/g1")
                .add(statement)
                .remove(statement);
        ds.abort();

        verify(log).onBegin(eq("message"), eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onAbort();
    }
}