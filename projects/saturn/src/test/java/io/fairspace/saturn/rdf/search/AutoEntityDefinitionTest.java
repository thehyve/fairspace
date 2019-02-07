package io.fairspace.saturn.rdf.search;

import org.junit.Test;

import static java.util.Collections.singletonList;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.assertEquals;

public class AutoEntityDefinitionTest {

    @Test
    public void getField() {
        var def = new AutoEntityDefinition();

        assertEquals("property", def.getField(createURI("http://example.com/property")));
        assertEquals("property", def.getField(createURI("http://example.com/path/property")));
        assertEquals("property", def.getField(createURI("http://example.com/path#property")));

        assertEquals(3, def.getPredicates("property").size());

        def.set("new-mapping", createURI("http://example.com/property"));

        assertEquals("new-mapping", def.getField(createURI("http://example.com/property")));
        assertEquals(singletonList(createURI("http://example.com/property")), def.getPredicates("new-mapping"));
    }
}