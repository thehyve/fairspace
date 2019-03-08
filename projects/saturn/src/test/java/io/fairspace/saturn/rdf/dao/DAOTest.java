package io.fairspace.saturn.rdf.dao;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import static io.fairspace.saturn.rdf.SparqlUtils.getWorkspaceURI;
import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static java.lang.Thread.sleep;
import static java.util.UUID.randomUUID;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class DAOTest {

    private Dataset dataset;
    private DAO dao;
    private Entity entity;
    private EntityEx entityEx;
    private LifecycleAware basicEntity;

    @Before
    public void before() {
        setWorkspaceURI("http://example.com/iri/");
        dataset = createTxnMem();
        dao = new DAO(connect(dataset), () -> "http://example.com/" + randomUUID());
        entity = new Entity();
        entityEx = new EntityEx();
        basicEntity = new LifecycleAware();
    }

    @Test
    public void testReadUnknown() {
        assertNull(dao.read(Entity.class, createURI("http://example.com/iri/unknown")));
    }

    @Test
    public void testIriGeneration() {
        assertNull(entity.getIri());
        dao.write(entity);
        var iri = entity.getIri();
        assertNotNull(iri);
        assertTrue(iri.getURI().startsWith(getWorkspaceURI()));
        dao.write(entity);
        assertEquals(iri, entity.getIri());
        assertNotEquals(iri, dao.write(new Entity()).getIri());
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
    public void testFloatPrimitiveProperty() {
        entity.setFloatPrimitiveValue(1.2345f);
        testWriteAndRead(entity);
    }
    
    @Test
    public void testFloatObjectProperty() {
        entity.setFloatObjectValue(1.2345f);
        testWriteAndRead(entity);
    }

    @Test
    public void testLongPrimitiveProperty() {
        entity.setLongPrimitiveValue(123L);
        testWriteAndRead(entity);
    }

    @Test
    public void testLongObjectProperty() {
        entity.setLongObjectValue(123L);
        testWriteAndRead(entity);
    }

    @Test
    public void testIntPrimitiveProperty() {
        entity.setIntPrimitiveValue(123);
        testWriteAndRead(entity);
    }

    @Test
    public void testIntObjectProperty() {
        entity.setIntObjectValue(123);
        testWriteAndRead(entity);
    }

    @Test
    public void testShortPrimitiveProperty() {
        entity.setShortPrimitiveValue((short)123);
        testWriteAndRead(entity);
    }

    @Test
    public void testShortObjectProperty() {
        entity.setShortObjectValue((short)123);
        testWriteAndRead(entity);
    }

    @Test
    public void testCharPrimitiveProperty() {
        entity.setCharPrimitiveValue((char)123);
        testWriteAndRead(entity);
    }

    @Test
    public void testCharObjectProperty() {
        entity.setCharacterObjectValue((char)123);
        testWriteAndRead(entity);
    }

    @Test
    public void testBytePrimitiveProperty() {
        entity.setBytePrimitiveValue((byte)123);
        testWriteAndRead(entity);
    }

    @Test
    public void testByteObjectProperty() {
        entity.setByteObjectValue((byte)123);
        testWriteAndRead(entity);
    }
    
    @Test
    public void testSetProperty() {
        entity.getTags().add("aaa");
        entity.getTags().add("bbb");
        entity.getTags().add("ccc");
        testWriteAndRead(entity);
    }

    @Test
    public void testList() {
        assertEquals(0, dao.list(LifecycleAware.class).size());

        dao.write(new LifecycleAware());
        dao.write(new LifecycleAware());
        dao.write(new LifecycleAware());

        var entities = dao.list(LifecycleAware.class);

        assertEquals(3, entities.size());
        dao.delete(entities.get(0));
        dao.markAsDeleted(entities.get(1));

        assertEquals(1, dao.list(LifecycleAware.class).size());
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
    public void testBasicPersistenceEntityLifecycle() {
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
        assertNull(dao.markAsDeleted(entity3));
    }

    @Test(expected = DAOException.class)
    public void testWriteUninitializedRequiredField() {
        dao.write(new WithRequired());
    }

    @Test(expected = DAOException.class)
    public void testReadWithoutRequiredField() {
        var e = new WithRequired();
        e.setRequiredField("xxx");
        dao.write(e);
        dataset.getDefaultModel().removeAll(createResource(e.getIri().getURI()), createProperty("http://example.com/iri/requiredField"), null);
        dao.read(WithRequired.class, e.getIri());
    }

    @Test(expected = DAOException.class)
    public void testReadWithoutType() {
        dao.write(entity);
        dataset.getDefaultModel().removeAll(createResource(entity.getIri().getURI()), RDF.type, null);
        dao.read(Entity.class, entity.getIri());
    }

    @Test(expected = DAOException.class)
    public void testNoDefaultConstructor() {
        testWriteAndRead(new NoDefaultConstructor(1));
    }

    @Test(expected = DAOException.class)
    public void testUnknownType() {
        entity.setUnknown(new StringBuilder());
        testWriteAndRead(entity);
    }

    @Test(expected = DAOException.class)
    public void testTooManyValues() {
        entity.setIntPrimitiveValue(1);
        dao.write(entity);
        dataset.getDefaultModel().add(createResource(entity.getIri().getURI()), createProperty("http://example.com/iri/intPrimitiveValue"), createTypedLiteral(2));
        dao.read(Entity.class, entity.getIri());
    }

    @Test(expected = DAOException.class)
    public void testReadingIntoUninitializedCollection() {
        var e = new NullableCollectionHolder();
        e.setItems(new ArrayList<>());
        e.getItems().add(1);
        testWriteAndRead(e);
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

        @RDFProperty("http://example.com/iri/floatPrimitiveValue")
        private float floatPrimitiveValue;

        @RDFProperty("http://example.com/iri/floatObjectValue")
        private Float floatObjectValue;

        @RDFProperty("http://example.com/iri/longPrimitiveValue")
        private long longPrimitiveValue;

        @RDFProperty("http://example.com/iri/longObjectValue")
        private Long longObjectValue;

        @RDFProperty("http://example.com/iri/intPrimitiveValue")
        private int intPrimitiveValue;

        @RDFProperty("http://example.com/iri/integerObjectValue")
        private Integer intObjectValue;

        @RDFProperty("http://example.com/iri/shortPrimitiveValue")
        private short shortPrimitiveValue;

        @RDFProperty("http://example.com/iri/shortObjectValue")
        private Short shortObjectValue;

        @RDFProperty("http://example.com/iri/charPrimitiveValue")
        private char charPrimitiveValue;

        @RDFProperty("http://example.com/iri/characterObjectValue")
        private Character characterObjectValue;

        @RDFProperty("http://example.com/iri/bytePrimitiveValue")
        private byte bytePrimitiveValue;

        @RDFProperty("http://example.com/iri/byteObjectValue")
        private Byte byteObjectValue;

        @RDFProperty("http://example.com/iri/booleanPrimitiveValue")
        private boolean booleanPrimitiveValue;

        @RDFProperty("http://example.com/iri/booleanObjectValue")
        private Boolean booleanObjectValue;

        @RDFProperty("http://example.com/iri/nodeValue")
        private Node nodeValue;

        @RDFProperty("http://example.com/iri/instantValue")
        private Instant instantValue;

        @RDFProperty("http://example.com/iri/tags")
        private final Set<String> tags = new HashSet<>();

        @RDFProperty("http://example.com/iri/unknown")
        private Object unknown;
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
    private static class LifecycleAware extends LifecycleAwarePersistentEntity {
    }

    @Data
    @EqualsAndHashCode(callSuper = true)
    @RDFType("http://example.com/iri/WithRequired")
    private static class WithRequired extends PersistentEntity {
        @RDFProperty(value = "http://example.com/iri/requiredField", required = true)
        private String requiredField;
    }

    @RDFType("http://example.com/iri/NoDefaultConstructor")
    private class NoDefaultConstructor extends PersistentEntity {
        final int value;

        private NoDefaultConstructor(int value) {
            this.value = value;
        }
    }

    @RDFType("http://example.com/iri/NullableCollectionHolder")
    @Data
    @EqualsAndHashCode(callSuper = true)
    private static class NullableCollectionHolder extends PersistentEntity {
        @RDFProperty("http://example.com/iri/items")
        private Collection<Integer> items;
    }
}