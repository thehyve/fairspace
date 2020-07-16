package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.*;

public class ReadableMetadataServiceTest {
    private static final String userVocabularyURI = "http://localhost/iri/user-vocabulary";
    private static final String GRAPH = "http://localhost/iri/graph";

    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Resource S3 = createResource("http://localhost/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");

    private static final Statement STMT1 = createStatement(S1, P1, S2);
    private static final Statement STMT2 = createStatement(S2, P1, S3);

    private static final Statement LBL_STMT1 = createStatement(S1, RDFS.label, createStringLiteral("subject1"));
    private static final Statement LBL_STMT2 = createStatement(S2, RDFS.label, createStringLiteral("subject2"));

    private Transactions txn = new SimpleTransactions(createTxnMem());
    private ReadableMetadataService api;

    @Before
    public void setUp() {
        api = new ReadableMetadataService(txn, createURI(GRAPH), createURI(userVocabularyURI));
    }

    @Test
    public void get() {
        assertEquals(0, api.get(null, false).size());

        txn.executeWrite(ds -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2));

        Model m1 = api.get(null, false);
        assertEquals(2, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));

        Model m2 = api.get(S1.getURI(), false);
        assertEquals(1, m2.size());
        assertTrue(m2.contains(STMT1));

        Model m3 = api.get(null, false);
        assertEquals(2, m3.size());
        assertTrue(m3.contains(STMT1));
        assertTrue(m3.contains(STMT2));

        Model m5 = api.get(S3.getURI(), false);
        assertTrue(m5.isEmpty());
    }

    @Test
    public void getWithImportantPropertiesReturnsFullModel() {
        assertEquals(0, api.get(null, true).size());

        txn.executeWrite(ds -> {
            ds.getNamedModel(GRAPH)
                    .add(STMT1).add(STMT2)
                    .add(LBL_STMT1).add(LBL_STMT2);
            setupImportantProperties();
        });

        // Fetching the whole model should work with object properties as well
        Model m1 = api.get(null, true);
        assertEquals(4, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));
        assertTrue(m1.contains(LBL_STMT1));
        assertTrue(m1.contains(LBL_STMT2));
    }

    @Test
    public void getWithImportantPropertiesWorksWithoutImportantProperties() {
        txn.executeWrite(ds -> ds.getNamedModel(GRAPH)
                .add(STMT1).add(STMT2)
                .add(LBL_STMT1).add(LBL_STMT2));

        // Fetching the whole model should work with object properties as well
        Model m1 = api.get(null, true);
        assertEquals(4, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));
        assertTrue(m1.contains(LBL_STMT1));
        assertTrue(m1.contains(LBL_STMT2));
    }

    @Test
    public void getWithImportantPropertiesIncludesImportantProperties() {
        var someProperty = createProperty("http://ex.com/some");
        var importantProperty = createProperty("http://ex.com/important");
        var unimportantProperty = createProperty("http://ex.com/unimportant");


        var clazz = createResource("http://ex.com/Class");
        var clazzShape = createResource("http://ex.com/ClassShape");
        var importantPropertyShape = createResource("http://ex.com/importantShape");
        var unimportantPropertyShape = createResource("http://ex.com/unimportantShape");;

        txn.executeWrite(ds -> {
            setupImportantProperties();

            ds.getNamedModel(userVocabularyURI)
                    .add(clazzShape, SHACLM.targetClass, clazz)
                    .add(clazzShape, SHACLM.property, importantPropertyShape)
                    .add(importantPropertyShape, SHACLM.path, importantProperty)
                    .addLiteral(importantPropertyShape, FS.importantProperty, true)
                    .add(clazzShape, SHACLM.property, unimportantPropertyShape)
                    .add(unimportantPropertyShape, SHACLM.path, unimportantProperty);

            ds.getNamedModel(GRAPH)
                    .add(S1, someProperty, S2)
                    .add(S2, RDF.type, clazz)
                    .add(S2, unimportantProperty, S3)
                    .add(S2, importantProperty, S3);
        });


        var result = api.get(S1.getURI(), true);

        assertEquals(2, result.size());
        assertTrue(result.contains(S1, someProperty, S2));
        assertTrue(result.contains(S2, importantProperty, S3));
        assertFalse(result.contains(S2, unimportantProperty, S3));
    }

    private void setupImportantProperties() {
        Resource labelShape = createResource("http://labelShape");
        Resource createdByShape = createResource("http://createdByShape");
        Resource md5Shape = createResource("http://md5Shape");

        txn.executeWrite(ds -> {
            ds.getNamedModel(userVocabularyURI).add(labelShape, FS.importantProperty, createTypedLiteral(Boolean.TRUE));
            ds.getNamedModel(userVocabularyURI).add(labelShape, SHACLM.path, RDFS.label);
            ds.getNamedModel(userVocabularyURI).add(createdByShape, FS.importantProperty, createTypedLiteral(Boolean.TRUE));
            ds.getNamedModel(userVocabularyURI).add(createdByShape, SHACLM.path, FS.createdBy);
            ds.getNamedModel(userVocabularyURI).add(md5Shape, FS.importantProperty, createTypedLiteral(Boolean.FALSE));
            ds.getNamedModel(userVocabularyURI).add(md5Shape, SHACLM.path, FS.md5);
        });
    }
}
