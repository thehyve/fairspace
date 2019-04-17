package io.fairspace.saturn.rdf;

import org.apache.jena.iri.IRIException;
import org.junit.Test;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static java.time.Instant.ofEpochMilli;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class SparqlUtilsTest {
    @Test
    public void plainLiteralsAreProperlyEscaped() {
        assertTrue(storedQuery("test_formatting", 123L).endsWith("\"123\"^^<http://www.w3.org/2001/XMLSchema#long>"));
    }

    @Test
    public void stringLiteralsAreProperlyEscaped() {
        assertTrue(storedQuery("test_formatting", "\"'<>?$%").endsWith("\"\\\"'<>?$%\""));
    }

    @Test
    public void validIrisAreProperlyEscaped() {
        assertTrue(storedQuery("test_formatting", createURI("http://example.com/path/subpath#hash")).endsWith("<http://example.com/path/subpath#hash>"));
    }

    @Test
    public void instantsAreProperlyFormatted() {
        assertTrue(storedQuery("test_formatting", ofEpochMilli(0L)).endsWith("\"1970-01-01T00:00:00Z\"^^<http://www.w3.org/2001/XMLSchema#dateTime>"));
    }

    @Test
    public void vocabularyAndWorkspacePrefixesAreAdded() {
        assertEquals(
                "PREFIX ws: <http://localhost/iri/>\n" +
                        "PREFIX vocabulary: <http://localhost/vocabulary/>\n" +
                        "\"\"",
                storedQuery("test_formatting", "")
        );
    }


    @Test(expected = IRIException.class)
    public void invalidIrisAreProhibited() {
        storedQuery("test_formatting", createURI("http://example.com>/path/subpath#hash"));
    }
}
