package io.fairspace.saturn.services.metadata;

import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;

import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static io.fairspace.saturn.rdf.Vocabulary.initVocabulary;
import static java.util.Arrays.asList;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.*;

public class MetadataServiceTest {

    private Dataset ds;
    private MetadataService api;

    private static final String baseURI = "http://example.com/";
    public static final String GRAPH = baseURI + "graph";

    private static final Resource S1 = createResource("http://fairspace.io/iri/S1");
    private static final Resource S2 = createResource("http://fairspace.io/iri/S2");
    private static final Resource S3 = createResource("http://fairspace.io/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");
    private static final Statement STMT1 = createStatement(S1, P1, S2);
    private static final Statement STMT2 = createStatement(S2, P1, S3);

    private static final Statement LBL_STMT1 = createStatement(S1, RDFS.label, createStringLiteral("subject1"));
    private static final Statement LBL_STMT2 = createStatement(S2, RDFS.label, createStringLiteral("subject2"));

    @Before
    public void setUp() {
        setWorkspaceURI(baseURI);
        ds = createTxnMem();
        initVocabulary(ds.asDatasetGraph(), createURI(baseURI + "vocabulary"));
        api = new MetadataService(new RDFConnectionLocal(ds), createURI(GRAPH));

    }

    @Test
    public void get() {
        assertEquals(0, api.get(null, null, null, false).size());

        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2));

        Model m1 = api.get(null, null, null, false);
        assertEquals(2, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));

        Model m2 = api.get(S1.getURI(), null, null, false);
        assertEquals(1, m2.size());
        assertTrue(m2.contains(STMT1));

        Model m3 = api.get(null, P1.getURI(), null, false);
        assertEquals(2, m3.size());
        assertTrue(m3.contains(STMT1));
        assertTrue(m3.contains(STMT2));

        Model m4 = api.get(null, null, S2.getURI(), false);
        assertEquals(1, m4.size());
        assertTrue(m4.contains(STMT1));

        Model m5 = api.get(S3.getURI(), null, null, false);
        assertTrue(m5.isEmpty());
    }

    @Test
    public void getWithLabels() {
        assertEquals(0, api.get(null, null, null, true).size());

        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2).add(LBL_STMT1).add(LBL_STMT2));

        Model m1 = api.get(null, null, null, true);
        assertEquals(4, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));
        assertTrue(m1.contains(LBL_STMT1));
        assertTrue(m1.contains(LBL_STMT2));

        Model m2 = api.get(S1.getURI(), null, null, true);
        assertEquals(3, m2.size());
        assertTrue(m2.contains(STMT1));
        assertTrue(m2.contains(LBL_STMT1));
        assertTrue(m2.contains(LBL_STMT2));

        Model m3 = api.get(null, P1.getURI(), null, true);
        assertEquals(3, m3.size());
        assertTrue(m3.contains(STMT1));
        assertTrue(m3.contains(STMT2));
        assertTrue(m2.contains(LBL_STMT2));

        Model m4 = api.get(null, null, S2.getURI(), true);
        assertEquals(2, m4.size());
        assertTrue(m4.contains(STMT1));
        assertTrue(m4.contains(LBL_STMT2));

        Model m5 = api.get(S3.getURI(), null, null, true);
        assertTrue(m5.isEmpty());
    }

    @Test
    public void put() {
        Model delta = createDefaultModel().add(STMT1).add(STMT2);

        api.put(delta);

        Model result = api.get(null, null, null, false);
        assertTrue(result.contains(STMT1) && result.contains(STMT2));
    }

    @Test
    public void delete() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2));

        api.delete(S1.getURI(), null, null);

        assertFalse(ds.getNamedModel(GRAPH).contains(STMT1));
        assertTrue(ds.getNamedModel(GRAPH).contains(STMT2));

        api.delete(null, P1.getURI(), null);

        assertTrue(ds.getNamedModel(GRAPH).isEmpty());
    }

    @Test
    public void deleteModel() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2));

        api.delete(createDefaultModel().add(STMT1));

        assertFalse(ds.getNamedModel(GRAPH).contains(STMT1));
        assertTrue(ds.getNamedModel(GRAPH).contains(STMT2));
    }

    @Test
    public void patch() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2));

        Statement newStmt1 = createStatement(S1, P1, S3);
        Statement newStmt2 = createStatement(S2, P1, S1);
        Statement newStmt3 = createStatement(S1, P2, S3);

        api.patch(createDefaultModel().add(newStmt1).add(newStmt2).add(newStmt3));
        assertTrue(ds.getNamedModel(GRAPH).contains(newStmt1));
        assertTrue(ds.getNamedModel(GRAPH).contains(newStmt2));
        assertTrue(ds.getNamedModel(GRAPH).contains(newStmt3));
        assertFalse(ds.getNamedModel(GRAPH).contains(STMT1));
        assertFalse(ds.getNamedModel(GRAPH).contains(STMT2));
    }

    @Test
    public void getByType() {
        executeWrite(ds, () -> ds.getNamedModel(GRAPH)
                .add(S1, RDF.type, createResource("http://fairspace.io/ontology#PersonConsent"))
                .add(LBL_STMT1)
                .add(S2, RDF.type, createResource("http://fairspace.io/ontology#ResearchProject"))
                .add(createResource("http://example.com/unknown"), RDF.type, createResource("http://fairspace.io/ontology#Unknown"))
                .add(createResource("http://example.com/person"), RDF.type, FOAF.Person)
        );

        var m1 = api.getByType("http://fairspace.io/ontology#PersonConsent");
        assertEquals(2, m1.size());
        assertTrue(m1.contains(S1, RDF.type, createResource("http://fairspace.io/ontology#PersonConsent")));
        assertTrue(m1.contains(LBL_STMT1));

        var m2 = api.getByType(null);
        assertEquals(3, m2.size());
        assertTrue(m2.contains(S1, RDF.type, createResource("http://fairspace.io/ontology#PersonConsent")));
        assertTrue(m2.contains(LBL_STMT1));
        assertTrue(m2.contains(S2, RDF.type, createResource("http://fairspace.io/ontology#ResearchProject")));

        var m3 = api.getByType("http://fairspace.io/ontology#Unknown");
        assertTrue(m3.isEmpty());

        var m4 = api.getByType(FOAF.Person.toString());
        assertTrue(m4.isEmpty());
    }

    @Test
    public void createPatchQuery() {
        String query = api.createPatchQuery(asList(STMT1, STMT2));
        assertEquals("DELETE WHERE \n" +
                "{\n" +
                "  GRAPH <http://example.com/graph> {\n" +
                "    <http://fairspace.io/iri/S1> <http://fairspace.io/ontology/P1> ?o .\n" +
                "  }\n" +
                "} ;\n" +
                "DELETE WHERE \n" +
                "{\n" +
                "  GRAPH <http://example.com/graph> {\n" +
                "    <http://fairspace.io/iri/S2> <http://fairspace.io/ontology/P1> ?o .\n" +
                "  }\n" +
                "} ;\n" +
                "INSERT DATA {\n" +
                "  GRAPH <http://example.com/graph> {\n" +
                "    <http://fairspace.io/iri/S1> <http://fairspace.io/ontology/P1> <http://fairspace.io/iri/S2> .\n" +
                "    <http://fairspace.io/iri/S2> <http://fairspace.io/ontology/P1> <http://fairspace.io/iri/S3> .\n" +
                "  }\n" +
                "}\n", query);
    }
}