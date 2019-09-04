package io.fairspace.saturn.rdf.transactions;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.ReadWrite;
import org.apache.jena.rdf.model.Statement;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.ExpectedSystemExit;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.Map;

import static io.fairspace.oidc_auth.model.OAuthAuthenticationToken.*;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;
import static org.apache.jena.system.Txn.executeRead;
import static org.apache.jena.system.Txn.executeWrite;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class TxnLogDatasetGraphTest {
    @Rule
    public final ExpectedSystemExit exit = ExpectedSystemExit.none();

    @Mock
    private TransactionLog log;
    private Dataset ds;
    private static final Statement statement = createStatement(createResource("http://example.com/s1"),
            createProperty("http://example.com/p1"),
            createPlainLiteral("blah"));

    @Before
    public void before() {
        ds = DatasetFactory.wrap(new TxnLogDatasetGraph(createTxnMem(), log,
                () -> new OAuthAuthenticationToken("", Map.of(SUBJECT_CLAIM, "userId", USERNAME_CLAIM, "userName", FULLNAME_CLAIM, "fullName", EMAIL_CLAIM, "email")),
                () -> "message"));
    }


    @Test
    public void shouldLogWriteTransactions() throws IOException {
        executeWrite(ds, () -> ds.getNamedModel("http://example.com/g1")
                .add(statement)
                .remove(statement));

        verify(log).onBegin(eq("message"), eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onCommit();
        verifyNoMoreInteractions(log);
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
        verifyNoMoreInteractions(log);
    }

    @Test
    public void shouldNotLogReadTransactions() throws IOException {
        executeRead(ds, () -> ds.getNamedModel("http://example.com/g1").listStatements().toList());

        verifyNoMoreInteractions(log);
    }

    @Test
    public void testThatAnExceptionWithinATransactionIsHandledProperly() throws IOException {
        try {
            executeWrite(ds, () -> {
                ds.getNamedModel("http://example.com/g1")
                        .add(statement)
                        .remove(statement);
                throw new RuntimeException();
            });

        } catch (Exception ignore) {
        }
        verify(log).onBegin(eq("message"), eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onAbort();
    }

    @Test
    public void errorOnCommitCausesSystemExit() throws IOException {
        exit.expectSystemExit();

        doThrow(IOException.class).when(log).onCommit();

        executeWrite(ds, () -> {
        });
    }
}