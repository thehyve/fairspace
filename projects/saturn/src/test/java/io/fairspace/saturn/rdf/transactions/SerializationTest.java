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
    private TransactionRecord original;

    @Before
    public void before() {
        original = new TransactionRecord();
        original.setTimestamp(currentTimeMillis());
        original.setUserName("John Smith");
        original.setUserId("123-FF-456");
        original.setCommitMessage("Some message");
        original.setAdded(new HashSet<>(asList(new Quad(
                createURI("http://example.com/graph1"),
                createURI("http://example.com/s1"),
                createURI("http://example.com/p1"),
                createLiteral("1")))));
        original.setDeleted(new HashSet<>(asList(new Quad(
                createURI("http://example.com/graph2"),
                createURI("http://example.com/s2"),
                createURI("http://example.com/p2"),
                createLiteral("2")))));
    }

    @Test
    public void sparqlSerializationWorks() throws IOException {
        testSerialization(SparqlTransactionSerializer.INSTANCE, SparqlTransactionDeserializer.INSTANCE);
    }


    @Test
    public void simpleSerializationWorks() throws IOException {
        testSerialization(SimpleTransactionSerializer.INSTANCE, SimpleTransactionDeserializer.INSTANCE);
    }

    private void testSerialization(TransactionSerializer serializer, TransactionDeserializer deserializer) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        serializer.write(original, out);
        TransactionRecord deserialized = deserializer.read(new ByteArrayInputStream(out.toByteArray()));
        assertEquals(original, deserialized);
    }
}