package io.fairspace.saturn.rdf.transactions;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import io.fairspace.saturn.ThreadContext;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
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
import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.sparql.core.DatasetGraphFactory.createTxnMem;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class TxnLogDatasetGraphTest {
    @Rule
    public final ExpectedSystemExit exit = ExpectedSystemExit.none();

    @Mock
    private TransactionLog log;
    private Dataset ds;
    private RDFLink rdfLink;
    private static final Statement statement = createStatement(createResource("http://example.com/s1"),
            createProperty("http://example.com/p1"),
            createPlainLiteral("blah"));

    @Before
    public void before() {
        setThreadContext(new ThreadContext(new OAuthAuthenticationToken("", Map.of(SUBJECT_CLAIM, "userId", USERNAME_CLAIM, "userName", FULLNAME_CLAIM, "fullName", EMAIL_CLAIM, "email")), "message", null));
        ds = DatasetFactory.wrap(new TxnLogDatasetGraph(createTxnMem(), log));
        rdfLink = new RDFLinkBatched(new RDFConnectionLocal(ds, Isolation.COPY), log);
    }


    @Test
    public void shouldLogWriteTransactions() throws IOException {
        rdfLink.executeWrite("system message", rdf -> ds.getNamedModel("http://example.com/g1")
                .add(statement)
                .remove(statement));

        verify(log).onBegin(eq("message"), eq("system message"), eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onCommit();
        verifyNoMoreInteractions(log);
    }

    @Test
    public void shouldHandleAbortedTransactions() throws IOException {
        try {
            rdfLink.executeWrite("system message", rdf -> {
                ds.getNamedModel("http://example.com/g1")
                        .add(statement)
                        .remove(statement);
                throw new RuntimeException();
            });
        } catch (RuntimeException ignore) {
        }
        verify(log).onBegin(eq("message"), eq("system message"), eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onAbort();
        verifyNoMoreInteractions(log);
    }

    @Test
    public void shouldNotLogReadTransactions() throws IOException {
        rdfLink.executeRead(rdf -> ds.getNamedModel("http://example.com/g1").listStatements().toList());

        verifyNoMoreInteractions(log);
    }

    @Test
    public void testThatAnExceptionWithinATransactionIsHandledProperly() throws IOException {
        try {
            rdfLink.executeWrite("system message", rdf -> {
                ds.getNamedModel("http://example.com/g1")
                        .add(statement)
                        .remove(statement);
                throw new RuntimeException();
            });

        } catch (Exception ignore) {
        }
        verify(log).onBegin(eq("message"), eq("system message"), eq("userId"), eq("fullName"), anyLong());
        verify(log).onAdd(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onDelete(createURI("http://example.com/g1"), statement.getSubject().asNode(), statement.getPredicate().asNode(), statement.getObject().asNode());
        verify(log).onAbort();
    }

    @Test
    public void errorOnCommitCausesSystemExit() throws IOException {
        exit.expectSystemExit();

        doThrow(IOException.class).when(log).onCommit();

        rdfLink.executeWrite(rdf -> { });
    }
}