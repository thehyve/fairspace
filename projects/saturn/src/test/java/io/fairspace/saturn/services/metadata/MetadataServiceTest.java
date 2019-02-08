package io.fairspace.saturn.services.metadata;

import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;

import static java.util.Arrays.asList;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.*;

public class MetadataServiceTest {
    private Dataset ds;
    private MetadataService api;

    private static final Resource S1 = createResource("http://fairspace.io/iri/S1");
    private static final Resource S2 = createResource("http://fairspace.io/iri/S2");
    private static final Resource S3 = createResource("http://fairspace.io/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");
    private static final Statement STMT1 = createStatement(S1, P1, S2);
    private static final Statement STMT2 = createStatement(S2, P1, S3);

    @Before
    public void setUp() {
        ds = createTxnMem();
        api = new MetadataService(new RDFConnectionLocal(ds));
    }

    @Test
    public void get() {
        assertEquals(0, api.get(null, null, null).size());

        executeWrite(ds, () -> ds.getDefaultModel().add(STMT1).add(STMT2));

        Model m1 = api.get(null, null, null);
        assertEquals(2, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));

        Model m2 = api.get(S1.getURI(), null, null);
        assertEquals(1, m2.size());
        assertTrue(m2.contains(STMT1));

        Model m3 = api.get(null, P1.getURI(), null);
        assertEquals(2, m3.size());
        assertTrue(m3.contains(STMT1));
        assertTrue(m3.contains(STMT2));

        Model m4 = api.get(null, null, S2.getURI());
        assertEquals(1, m4.size());
        assertTrue(m4.contains(STMT1));

        Model m5 = api.get(S3.getURI(), null, null);
        assertTrue(m5.isEmpty());
    }

    @Test
    public void put() {
        Model delta = createDefaultModel().add(STMT1).add(STMT2);

        api.put(delta);

        Model result = api.get(null, null, null);
        assertTrue(result.contains(STMT1) && result.contains(STMT2));
    }

    @Test
    public void delete() {
        executeWrite(ds, () -> ds.getDefaultModel().add(STMT1).add(STMT2));

        api.delete(S1.getURI(), null, null);

        assertFalse(ds.getDefaultModel().contains(STMT1));
        assertTrue(ds.getDefaultModel().contains(STMT2));

        api.delete(null, P1.getURI(), null);

        assertTrue(ds.getDefaultModel().isEmpty());
    }

    @Test
    public void deleteModel() {
        executeWrite(ds, () -> ds.getDefaultModel().add(STMT1).add(STMT2));

        api.delete(createDefaultModel().add(STMT1));

        assertFalse(ds.getDefaultModel().contains(STMT1));
        assertTrue(ds.getDefaultModel().contains(STMT2));
    }

    @Test
    public void patch() {
        executeWrite(ds, () -> ds.getDefaultModel().add(STMT1).add(STMT2));

        Statement newStmt1 = createStatement(S1, P1, S3);
        Statement newStmt2 = createStatement(S2, P1, S1);
        Statement newStmt3 = createStatement(S1, P2, S3);

        api.patch(createDefaultModel().add(newStmt1).add(newStmt2).add(newStmt3));
        assertTrue(ds.getDefaultModel().contains(newStmt1));
        assertTrue(ds.getDefaultModel().contains(newStmt2));
        assertTrue(ds.getDefaultModel().contains(newStmt3));
        assertFalse(ds.getDefaultModel().contains(STMT1));
        assertFalse(ds.getDefaultModel().contains(STMT2));
    }

    @Test
    public void createPatchQuery() {
        String query = MetadataService.createPatchQuery(asList(STMT1, STMT2));
        assertEquals("DELETE WHERE \n" +
                "{\n" +
                "  <http://fairspace.io/iri/S1> <http://fairspace.io/ontology/P1> ?o .\n" +
                "} ;\n" +
                "DELETE WHERE \n" +
                "{\n" +
                "  <http://fairspace.io/iri/S2> <http://fairspace.io/ontology/P1> ?o .\n" +
                "} ;\n" +
                "INSERT DATA {\n" +
                "  <http://fairspace.io/iri/S1> <http://fairspace.io/ontology/P1> <http://fairspace.io/iri/S2> .\n" +
                "  <http://fairspace.io/iri/S2> <http://fairspace.io/ontology/P1> <http://fairspace.io/iri/S3> .\n" +
                "}\n", query);
    }
}