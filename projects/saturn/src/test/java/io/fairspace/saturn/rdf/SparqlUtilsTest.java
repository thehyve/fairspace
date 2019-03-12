package io.fairspace.saturn.rdf;

import org.junit.Test;

import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static org.junit.Assert.assertEquals;

public class SparqlUtilsTest {
    @Test
    public void literalsAreProperlyEscaped() {
       assertEquals("PREFIX ws: <http://fairspace.io/iri/>\n" +
               "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n" +
               "\"\\\"'<>?$%\"",
               storedQuery("stored1", "\"'<>?$%"));
    }

}