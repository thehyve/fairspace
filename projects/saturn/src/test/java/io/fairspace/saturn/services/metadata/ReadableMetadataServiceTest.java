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
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.rdf.model.ResourceFactory.createStringLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@RunWith(MockitoJUnitRunner.class)
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

    private Dataset ds;
    private ReadableMetadataService api;

    @Before
    public void setUp() {
        ds = createTxnMem();
        api = new ReadableMetadataService(new RDFConnectionLocal(ds), createURI(GRAPH));
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
    public void getByType() {
        Resource personConsent = createResource("http://fairspace.io/ontology#PersonConsent");
        Resource researchProject = createResource("http://fairspace.io/ontology#ResearchProject");
        Property showInCatalog = createProperty("http://fairspace.io/ontology#showInCatalog");
        Property targetClass = createProperty("http://www.w3.org/ns/shacl#targetClass");
        Resource personConsentShape = createProperty("http://fairspace.io/ontology#PersonConsentShape");
        Resource researchShape = createProperty("http://fairspace.io/ontology#ResearchProjectShape");

        // Setup the model
        executeWrite(ds, () -> {
            ds.getNamedModel(GRAPH)
                    .add(S1, RDF.type, personConsent)
                    .add(LBL_STMT1)
                    .add(S2, RDF.type, researchProject)
                    .add(createResource("http://example.com/unknown"), RDF.type, createResource("http://fairspace.io/ontology#Unknown"))
                    .add(createResource("http://example.com/person"), RDF.type, FOAF.Person);

            // Mark personConsent and researchProject as fairspace entities
            ds.getNamedModel(userVocabularyURI)
                    .add(personConsentShape, targetClass, personConsent)
                    .add(personConsentShape, showInCatalog, createTypedLiteral(true))
                    .add(researchShape, targetClass, researchProject)
                    .add(researchShape, showInCatalog, createTypedLiteral(true))
                    .add(personConsent, showInCatalog, createTypedLiteral(true))
                    .add(FOAF.Person, showInCatalog, createTypedLiteral(false));
        });

        System.out.println("--- Statements in " + GRAPH);
        ds.getNamedModel(GRAPH).listStatements().forEachRemaining(System.out::println);
        System.out.println("--- Statements in " + userVocabularyURI);
        ds.getNamedModel(userVocabularyURI).listStatements().forEachRemaining(System.out::println);


        // Test whether entities of a single type can be retrieved, including the label
        var m1 = api.getByType("http://fairspace.io/ontology#PersonConsent");
        assertEquals(2, m1.size());
        assertTrue(m1.contains(S1, RDF.type, personConsent));
        assertTrue(m1.contains(LBL_STMT1));

        // If no type is given, return all fairspace entities, including the label
        var m2 = api.getByType(null);
        assertEquals(3, m2.size());
        assertTrue(m2.contains(S1, RDF.type, personConsent));
        assertTrue(m2.contains(LBL_STMT1));
        assertTrue(m2.contains(S2, RDF.type, researchProject));

        // If the type is not a fairspace entity, do not return any entity for that type
        var m3 = api.getByType("http://fairspace.io/ontology#Unknown");
        assertTrue(m3.isEmpty());

        // If the type is not a fairspace entity, do not return any entity for that type
        var m4 = api.getByType(FOAF.Person.toString());
        assertTrue(m4.isEmpty());
    }

}
