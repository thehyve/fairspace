package io.fairspace.saturn.rdf.beans;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.jena.graph.Node;
import org.junit.Before;
import org.junit.Test;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class BeanPersisterTest {

    private BeanPersister persister;
    private Entity entity;

    @Before
    public void before() {
        setWorkspaceURI("http://example.com/iri/");
        persister = new BeanPersister(connect(createTxnMem()));
        entity = new Entity();
    }

    @Test
    public void testReadUnknown() {
        assertNull(persister.read(Entity.class, createURI("http://example.com/iri/unknown")));
    }


    @Test
    public void testNodeProperty() {
        entity.setNodeValue(createURI("http://example.com/iri/resource"));
        testWriteAndRead();
    }

    @Test
    public void testStringProperty() {
        entity.setStringValue("str");
        testWriteAndRead();
    }

    @Test
    public void testDoublePrimitiveProperty() {
        entity.setDoublePrimitiveValue(1.2345);
        testWriteAndRead();
    }

    @Test
    public void testDoubleObjectProperty() {
        entity.setDoubleObjectValue(1.2345);
        testWriteAndRead();
    }

    @Test
    public void testListProperty() {
        entity.getTags().add("aaa");
        entity.getTags().add("bbb");
        entity.getTags().add("ccc");
        testWriteAndRead();
    }

    @Test
    public void testSet() {
        assertEquals(0, persister.list(Entity.class).size());

        persister.write(new Entity());
        persister.write(new Entity());
        persister.write(new Entity());

        assertEquals(3, persister.list(Entity.class).size());
    }

    @Test
    public void testInstantProperty() {
        entity.setInstantValue(Instant.now());
        persister.write(entity);
        // There can be some rounding within 1 ms
        assertEquals(entity.getInstantValue().toEpochMilli(), persister.read(Entity.class, entity.getIri()).getInstantValue().toEpochMilli());
    }

    @Test
    public void testDelete() {
        persister.write(entity);
        persister.delete(entity);

        assertNull(persister.read(Entity.class, entity.getIri()));
    }

    @Test
    public void testUpdate() {
        entity.setStringValue("str1");
        testWriteAndRead();
        entity.setStringValue("str2");
        testWriteAndRead();
    }


    private void testWriteAndRead() {
        persister.write(entity);
        assertEquals(entity, persister.read(Entity.class, entity.getIri()));
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @RDFType("http://example.com/iri/Entity")
    private static class Entity extends PersistentEntity {
        @RDFProperty("http://example.com/iri/stringValue")
        private String stringValue;

        @RDFProperty("http://example.com/iri/doublePrimitiveValue")
        private double doublePrimitiveValue;

        @RDFProperty("http://example.com/iri/doubleObjectValue")
        private Double doubleObjectValue;

        @RDFProperty("http://example.com/iri/nodeValue")
        private Node nodeValue;

        @RDFProperty("http://example.com/iri/instantValue")
        private Instant instantValue;

        @RDFProperty("http://example.com/iri/tags")
        private final Set<String> tags = new HashSet<>();
    }
}