package io.fairspace.saturn.rdf.transactions;

import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.apache.jena.graph.NodeFactory.createBlankNode;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.mockito.Mockito.*;

public class RDFPatchTransactionCodecTest {
    TransactionCodec codec = new RDFPatchTransactionCodec();
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    TransactionListener writeListener = codec.write(out);

    public RDFPatchTransactionCodecTest() throws IOException {
    }

    @Test
    public void testWriteAndRead() throws IOException {
        writeListener.onBegin();
        writeListener.onMetadata("user message", "system message", "userId", "userName", 123L);
        writeListener.onAdd(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        writeListener.onDelete(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        var blank = createBlankNode();
        writeListener.onAdd(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), blank);
        writeListener.onMetadata("another user message", "another system message", "another userId", "another userName", 124L);
        writeListener.onAdd(createURI("http://example.com/graph2"), createURI("http://example.com/subject2"), createURI("http://example.com/predicate2"), createURI("http://example.com/object2"));
        writeListener.onCommit();

        var in = new ByteArrayInputStream(out.toByteArray());
        var readListener = mock(TransactionListener.class);
        codec.read(in, readListener);

        verify(readListener).onBegin();
        verify(readListener).onMetadata("user message", "system message", "userId", "userName", 123L);
        verify(readListener).onAdd(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        verify(readListener).onDelete(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        verify(readListener).onAdd(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), blank);
        verify(readListener).onMetadata("another user message", "another system message", "another userId", "another userName", 124L);
        verify(readListener).onAdd(createURI("http://example.com/graph2"), createURI("http://example.com/subject2"), createURI("http://example.com/predicate2"), createURI("http://example.com/object2"));
        verify(readListener).onCommit();
        verifyNoMoreInteractions(readListener);
    }

    @Test
    public void testNoMeta() throws IOException {
        writeListener.onBegin();
        writeListener.onMetadata(null, null,null, null, 123L);
        writeListener.onCommit();

        var in = new ByteArrayInputStream(out.toByteArray());
        var readListener = mock(TransactionListener.class);
        codec.read(in, readListener);

        verify(readListener).onBegin();
        verify(readListener).onMetadata(null, null, null, null, 123L);
        verify(readListener).onCommit();
        verifyNoMoreInteractions(readListener);
    }
}