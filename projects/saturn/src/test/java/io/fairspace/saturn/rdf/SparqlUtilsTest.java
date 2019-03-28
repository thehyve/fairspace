package io.fairspace.saturn.rdf;

import org.apache.jena.iri.IRIException;
import org.junit.Test;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.time.Instant.ofEpochMilli;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.assertEquals;

public class SparqlUtilsTest {
    @Test
    public void plainLiteralsAreProperlyEscaped() {
        assertEquals("PREFIX ws: <http://localhost:3000/iri/>\n" +
                        "\"123\"^^<http://www.w3.org/2001/XMLSchema#long>",
                storedQuery("test_formatting", 123L));
    }

    @Test
    public void stringLiteralsAreProperlyEscaped() {
        assertEquals("PREFIX ws: <http://localhost:3000/iri/>\n" +
                        "\"\\\"'<>?$%\"",
                storedQuery("test_formatting", "\"'<>?$%"));
    }

    @Test
    public void validIrisAreProperlyEscaped() {
        assertEquals("PREFIX ws: <http://localhost:3000/iri/>\n" +
                        "<http://example.com/path/subpath#hash>",
                storedQuery("test_formatting", createURI("http://example.com/path/subpath#hash")));
    }

    @Test
    public void instantsAreProperlyFormatted() {
        assertEquals("PREFIX ws: <http://localhost:3000/iri/>\n" +
                        "\"1970-01-01T00:00:00Z\"^^<http://www.w3.org/2001/XMLSchema#dateTime>",
                storedQuery("test_formatting", ofEpochMilli(0L)));
    }

    @Test(expected = IRIException.class)
    public void invalidIrisAreProhibited() {
        storedQuery("test_formatting", createURI("http://example.com>/path/subpath#hash"));
    }
}