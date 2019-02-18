package io.fairspace.saturn.rdf;

import org.junit.Test;

import static io.fairspace.saturn.rdf.SparqlUtils.formatQuery;
import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.junit.Assert.assertEquals;

public class SparqlUtilsTest {

    @Test
    public void literalsAreProperlyEscaped() {
        setWorkspaceURI("http://example.com");
        assertEquals("PREFIX ws: <http://example.com>\n\"$1\" \"?2\" \"?0\"",
                formatQuery("?0 ?1 ?2", "$1", "?2", "?0"));
        assertEquals("PREFIX ws: <http://example.com>\n" +
                        "\"firstLine\\nsecondLine\\n\" ?1 ?2",
                formatQuery("?0 ?1 ?2", "firstLine\nsecondLine\n"));
    }

    @Test
    public void quotesAreProperlyEscaped() {
        setWorkspaceURI("http://example.com");
        assertEquals("PREFIX ws: <http://example.com>\n\"\\\"\" \"\\'\"",
                formatQuery("?0 ?1", "\"", "'"));
    }
}