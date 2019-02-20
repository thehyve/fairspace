package io.fairspace.saturn.rdf.transactions;

import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.mockito.Mockito.*;

public class SparqlTransactionCodecTest {

    @Test
    public void testWriteAndRead() throws IOException {
        var codec = new SparqlTransactionCodec();
        var out = new ByteArrayOutputStream();
        var writeListener = codec.write(out);

        writeListener.onBegin("message", "userId", "userName", 123L);
        writeListener.onAdd(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        writeListener.onDelete(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        writeListener.onCommit();

        var in = new ByteArrayInputStream(out.toByteArray());
        var readListener = mock(TransactionListener.class);
        codec.read(in, readListener);

        verify(readListener).onBegin("message", "userId", "userName", 123L);
        verify(readListener).onAdd(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        verify(readListener).onDelete(createURI("http://example.com/graph"), createURI("http://example.com/subject"), createURI("http://example.com/predicate"), createURI("http://example.com/object"));
        verify(readListener).onCommit();
        verifyNoMoreInteractions(readListener);
    }

}