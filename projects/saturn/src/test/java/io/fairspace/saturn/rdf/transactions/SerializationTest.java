package io.fairspace.saturn.rdf.transactions;

import org.apache.jena.sparql.core.Quad;
import org.junit.Before;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashSet;

import static java.lang.System.currentTimeMillis;
import static java.util.Arrays.asList;
import static org.apache.jena.graph.NodeFactory.createLiteral;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.assertEquals;

public class SerializationTest {
    private TransactionRecord additionsAndDeletions;
    private TransactionRecord additionsOnly;
    
    @Before
    public void before() {
        additionsAndDeletions = new TransactionRecord();
        additionsAndDeletions.setTimestamp(currentTimeMillis());
        additionsAndDeletions.setUserName("John Smith");
        additionsAndDeletions.setUserId("123-FF-456");
        additionsAndDeletions.setCommitMessage("Some message");
        additionsAndDeletions.setAdded(new HashSet<>(asList(new Quad(
                createURI("http://example.com/graph1"),
                createURI("http://example.com/s1"),
                createURI("http://example.com/p1"),
                createLiteral("1")))));
        additionsAndDeletions.setDeleted(new HashSet<>(asList(new Quad(
                createURI("http://example.com/graph2"),
                createURI("http://example.com/s2"),
                createURI("http://example.com/p2"),
                createLiteral("2")))));

        additionsOnly = new TransactionRecord();
        additionsOnly.setTimestamp(currentTimeMillis());
        additionsOnly.setUserName("John Smith");
        additionsOnly.setUserId("123-FF-456");
        additionsOnly.setCommitMessage("Some message");
        additionsOnly.setAdded(new HashSet<>(asList(new Quad(
                createURI("http://example.com/graph1"),
                createURI("http://example.com/s1"),
                createURI("http://example.com/p1"),
                createLiteral("1")))));
        additionsOnly.setDeleted(new HashSet<>());
    }

    @Test
    public void sparqlSerializationWorks() throws IOException {
        testSerialization(additionsAndDeletions, new SparqlTransactionCodec());
    }


    @Test
    public void testNoDeletions() throws IOException {
        testSerialization(additionsOnly, new SparqlTransactionCodec());
    }

    @Test(expected = IOException.class)
    public void invalidDataCausesIOException() throws IOException {
        new SparqlTransactionCodec().read(new ByteArrayInputStream("invalid SPARQL".getBytes()));
    }

    private void testSerialization(TransactionRecord original, TransactionCodec transactionCodec) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        transactionCodec.write(original, out);
        TransactionRecord deserialized = transactionCodec.read(new ByteArrayInputStream(out.toByteArray()));
        assertEquals(original, deserialized);
    }
}