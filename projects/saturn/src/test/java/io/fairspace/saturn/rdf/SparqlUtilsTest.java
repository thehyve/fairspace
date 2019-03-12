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
        assertEquals("PREFIX ws: <http://fairspace.io/iri/>\n" +
                        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                        "\"123\"^^xsd:long",
                storedQuery("stored1", 123L));
    }

    @Test
    public void stringLiteralsAreProperlyEscaped() {
        assertEquals("PREFIX ws: <http://fairspace.io/iri/>\n" +
                        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                        "\"\\\"'<>?$%\"",
                storedQuery("stored1", "\"'<>?$%"));
    }

    @Test
    public void validIrisAreProperlyEscaped() {
        assertEquals("PREFIX ws: <http://fairspace.io/iri/>\n" +
                        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                        "<http://example.com/path/subpath#hash>",
                storedQuery("stored1", createURI("http://example.com/path/subpath#hash")));
    }

    @Test
    public void instantsProperlyFormatted() {
        assertEquals("PREFIX ws: <http://fairspace.io/iri/>\n" +
                        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
                        "\"1970-01-01T00:00:00Z\"^^xsd:dateTime",
                storedQuery("stored1", ofEpochMilli(0L)));
    }

    @Test(expected = IRIException.class)
    public void invalidIrisAreProhibited() {
        storedQuery("stored1", createURI("http://example.com>/path/subpath#hash"));
    }
}