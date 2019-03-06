package io.fairspace.saturn.rdf.dao;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.jena.graph.Node;
import org.junit.Before;
import org.junit.Test;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static java.lang.Thread.sleep;
import static java.util.UUID.randomUUID;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class DAOTest {

    private DAO dao;
    private Entity entity;
    private EntityEx entityEx;
    private Basic basicEntity;

    @Before
    public void before() {
        setWorkspaceURI("http://example.com/iri/");
        dao = new DAO(connect(createTxnMem()), () -> "http://example.com/" + randomUUID());
        entity = new Entity();
        entityEx = new EntityEx();
        basicEntity = new Basic();
    }

    @Test
    public void testReadUnknown() {
        assertNull(dao.read(Entity.class, createURI("http://example.com/iri/unknown")));
    }


    @Test
    public void testNodeProperty() {
        entity.setNodeValue(createURI("http://example.com/iri/resource"));
        testWriteAndRead(entity);
    }

    @Test
    public void testStringProperty() {
        entity.setStringValue("str");
        testWriteAndRead(entity);
    }

    @Test
    public void testDoublePrimitiveProperty() {
        entity.setDoublePrimitiveValue(1.2345);
        testWriteAndRead(entity);
    }

    @Test
    public void testDoubleObjectProperty() {
        entity.setDoubleObjectValue(1.2345);
        testWriteAndRead(entity);
    }

    @Test
    public void testListProperty() {
        entity.getTags().add("aaa");
        entity.getTags().add("bbb");
        entity.getTags().add("ccc");
        testWriteAndRead(entity);
    }

    @Test
    public void testSet() {
        assertEquals(0, dao.list(Entity.class).size());

        dao.write(new Entity());
        dao.write(new Entity());
        dao.write(new Entity());

        assertEquals(3, dao.list(Entity.class).size());
    }

    @Test
    public void testInstantProperty() {
        entity.setInstantValue(Instant.now());
        dao.write(entity);
        // There can be some rounding within 1 ms
        assertEquals(entity.getInstantValue().toEpochMilli(), dao.read(Entity.class, entity.getIri()).getInstantValue().toEpochMilli());
    }

    @Test
    public void testDelete() {
        dao.write(entity);
        dao.delete(entity);

        assertNull(dao.read(Entity.class, entity.getIri()));
    }

    @Test
    public void testUpdate() {
        entity.setStringValue("str1");
        testWriteAndRead(entity);
        entity.setStringValue("str2");
        testWriteAndRead(entity);
    }


    @Test
    public void testInheritance() {
        entityEx.setStringValue("str1");
        entityEx.setNewProperty("str2");
        testWriteAndRead(entityEx);
    }

    @Test
    public void testBasicPersistenceEntityLifecycle() throws InterruptedException {
        dao.write(basicEntity);

        var entity1 = dao.read(basicEntity.getClass(), basicEntity.getIri());

        assertNotNull(entity1.getIri());
        assertNotNull(entity1.getDateCreated());
        assertEquals(entity1.getDateCreated(), entity1.getDateModified());
        assertNull(entity1.getDateDeleted());
        assertNotNull(entity1.getCreatedBy());
        assertEquals(entity1.getCreatedBy(), entity1.getModifiedBy());
        assertNull(entity1.getDeletedBy());

        var t1 = entity1.getDateCreated();

        dao.write(entity1);
        var entity2 = dao.read(basicEntity.getClass(), basicEntity.getIri());
        assertEquals(t1, entity2.getDateCreated());
        assertTrue(entity2.getDateModified().compareTo(t1) > 0);
        assertNotNull(entity2.getModifiedBy());
        assertNotEquals(entity2.getCreatedBy(), entity2.getModifiedBy());
        assertNull(entity2.getDeletedBy());

        var entity3 = dao.markAsDeleted(entity2);
        assertNotNull(entity3.getDateDeleted());
        assertNotNull(entity3.getDeletedBy());
        assertNull(dao.read(basicEntity.getClass(), basicEntity.getIri()));
    }

    @Test(expected = PersistenceException.class)
    public void testWriteUninitializedRequiredField() {
        dao.write(new WithRequired());
    }


    private void testWriteAndRead(PersistentEntity entity) {
        dao.write(entity);
        assertEquals(entity, dao.read(entity.getClass(), entity.getIri()));
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

    @Data
    @EqualsAndHashCode(callSuper = true)
    @RDFType("http://example.com/iri/EntityEx")
    private static class EntityEx extends Entity {
        @RDFProperty("http://example.com/iri/newProperty")
        private String newProperty;
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @RDFType("http://example.com/iri/BasicEntity")
    private static class Basic extends BasicPersistentEntity {
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @RDFType("http://example.com/iri/WithRequired")
    private static class WithRequired extends PersistentEntity {
        @RDFProperty(value = "http://example.com/iri/requiredField", required = true)
        private String requiredField;
    }
}