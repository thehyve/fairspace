package io.fairspace.saturn.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.apache.jena.graph.Node;
import org.junit.Test;

import java.io.IOException;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.assertEquals;

public class IRIModuleTest {
    @Test
    public void serializeAndDeserialize() throws IOException {
        var obj = new Entity();
        obj.setIri(createURI("http://example.com/iri"));
        var mapper = new ObjectMapper().registerModule(new IRIModule());
        var s = mapper.writeValueAsString(obj);
        assertEquals("{\"iri\":\"http://example.com/iri\"}", s);
        assertEquals(obj, mapper.readValue(s, Entity.class));
    }

    @Data
    public static class Entity {
        private Node iri;
    }
}