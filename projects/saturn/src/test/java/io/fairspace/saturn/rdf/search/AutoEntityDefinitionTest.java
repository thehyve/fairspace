package io.fairspace.saturn.rdf.search;

import org.junit.Test;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.assertEquals;

public class AutoEntityDefinitionTest {

    @Test
    public void getField() {
        var def = new AutoEntityDefinition();

        assertEquals("property", def.getField(createURI("http://example.com/property")));
        assertEquals("property", def.getField(createURI("http://example.com/path/property")));
        assertEquals("property", def.getField(createURI("http://example.com/path#property")));

        def.set("new-mapping", createURI("http://example.com/property"));

        assertEquals("property", def.getField(createURI("http://example.com/property")));
    }
}