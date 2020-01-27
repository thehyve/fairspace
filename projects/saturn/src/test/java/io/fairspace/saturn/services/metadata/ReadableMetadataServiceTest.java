package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import io.fairspace.saturn.rdf.transactions.DatasetJobSupportInMemory;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

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

    private DatasetJobSupport ds = new DatasetJobSupportInMemory();
    private ReadableMetadataService api;

    @Before
    public void setUp() {
        api = new ReadableMetadataService(ds, createURI(GRAPH), createURI(userVocabularyURI));
    }

    @Test
    public void get() {
        assertEquals(0, api.get(null, null, null, false).size());

        ds.executeWrite(() -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2));

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
    public void getWithImportantPropertiesReturnsFullModel() {
        assertEquals(0, api.get(null, null, null, true).size());

        ds.executeWrite(() -> {
            ds.getNamedModel(GRAPH)
                    .add(STMT1).add(STMT2)
                    .add(LBL_STMT1).add(LBL_STMT2);
            setupImportantProperties();
        });

        // Fetching the whole model should work with object properties as well
        Model m1 = api.get(null, null, null, true);
        assertEquals(4, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));
        assertTrue(m1.contains(LBL_STMT1));
        assertTrue(m1.contains(LBL_STMT2));
    }

    @Test
    public void getWithImportantPropertiesWorksWithoutImportantProperties() {
        ds.executeWrite(() -> {
            ds.getNamedModel(GRAPH)
                    .add(STMT1).add(STMT2)
                    .add(LBL_STMT1).add(LBL_STMT2);
        });

        // Fetching the whole model should work with object properties as well
        Model m1 = api.get(null, null, null, true);
        assertEquals(4, m1.size());
        assertTrue(m1.contains(STMT1));
        assertTrue(m1.contains(STMT2));
        assertTrue(m1.contains(LBL_STMT1));
        assertTrue(m1.contains(LBL_STMT2));
    }

    @Test
    public void getWithImportantPropertiesIncludesImportantProperties() {
        Statement createdBy = createStatement(S3, FS.createdBy, createStringLiteral("unit test"));
        Statement dateCreated = createStatement(S3, FS.dateCreated, createStringLiteral("yesterday"));
        Statement md5 = createStatement(S3, FS.md5, createStringLiteral("some-hash"));

        ds.executeWrite(() -> {
            setupImportantProperties();
            ds.getNamedModel(GRAPH)
                    .add(STMT1).add(STMT2)
                    .add(LBL_STMT1).add(LBL_STMT2)
                    .add(createdBy).add(dateCreated).add(md5);
        });

        // The important properties of any related object should be returned as well
        // In this case we expect the important properties of S2 to be returned
        Model m2 = api.get(S1.getURI(), null, null, true);
        assertEquals(3, m2.size());
        assertTrue(m2.contains(STMT1));
        assertTrue(m2.contains(LBL_STMT1));
        assertTrue(m2.contains(LBL_STMT2));

        // The important properties of any related object should be returned as well
        // In this case we expect the important properties of S2 and S3 to be returned
        // Only createdBy is marked as fs:importantProperty = true in the vocabulary
        Model m3 = api.get(null, P1.getURI(), null, true);
        assertEquals(4, m3.size());
        assertTrue(m3.contains(STMT1));
        assertTrue(m3.contains(STMT2));
        assertTrue(m3.contains(LBL_STMT2));
        assertTrue(m3.contains(createdBy));

        // The important property of any related object should be returned as well
        // In this case we expect the important properties of S2 to be returned
        Model m4 = api.get(null, null, S2.getURI(), true);
        assertEquals(2, m4.size());
        assertTrue(m4.contains(STMT1));
        assertTrue(m4.contains(LBL_STMT2));
    }

    @Test
    public void getByTypeInCatalog() {
        setupModelForTypes();

        Resource personConsentEx = createResource("http://fairspace.io/ontology#PersonConsentEx");
        Resource researchProject = createResource("http://fairspace.io/ontology#ResearchProject");
        Resource user = createResource("http://fairspace.io/ontology#User");

        // Test whether entities of a single type can be retrieved, including the label
        var m1 = api.getByType("http://fairspace.io/ontology#PersonConsent", true);
        assertEquals(2, m1.size());
        assertTrue(m1.contains(S1, RDF.type, personConsentEx));
        assertTrue(m1.contains(LBL_STMT1));

        // If no type is given, return all fairspace entities, including the label
        var m2 = api.getByType(null, true);
        assertEquals(3, m2.size());
        assertTrue(m2.contains(S1, RDF.type, personConsentEx));
        assertTrue(m2.contains(LBL_STMT1));
        assertTrue(m2.contains(S2, RDF.type, researchProject));

        // If the shape for a type is not known, do not return any entity for that type
        var m3 = api.getByType("http://fairspace.io/ontology#Unknown", true);
        assertTrue(m3.isEmpty());

        // If the type is not a fairspace entity, do not return any entity for that type
        var m4 = api.getByType(user.toString(), true);
        assertTrue(m4.isEmpty());
    }

    @Test
    public void getAllByType() {
        setupModelForTypes();

        Resource personConsentEx = createResource("http://fairspace.io/ontology#PersonConsentEx");
        Resource researchProject = createResource("http://fairspace.io/ontology#ResearchProject");
        Resource user = createResource("http://fairspace.io/ontology#User");

        // Test whether entities of a single type can be retrieved, including the label
        var m1 = api.getByType("http://fairspace.io/ontology#PersonConsent", false);
        assertEquals(2, m1.size());
        assertTrue(m1.contains(S1, RDF.type, personConsentEx));
        assertTrue(m1.contains(LBL_STMT1));

        // If no type is given, return all fairspace entities, including the label
        var m2 = api.getByType(null, false);
        assertEquals(4, m2.size());
        assertTrue(m2.contains(S1, RDF.type, personConsentEx));
        assertTrue(m2.contains(LBL_STMT1));
        assertTrue(m2.contains(S2, RDF.type, researchProject));
        assertTrue(m2.contains(createResource("http://example.com/user"), RDF.type, user));

        // If the shape for a type is not known, do not return any entity for that type
        var m3 = api.getByType("http://fairspace.io/ontology#Unknown", false);
        assertTrue(m3.isEmpty());

        // If the type is not a fairspace entity, do not return any entity for that type
        var m4 = api.getByType(user.toString(), false);
        assertEquals(1, m4.size());
        assertTrue(m4.contains(createResource("http://example.com/user"), RDF.type, user));
    }

    @Test(expected = TooManyTriplesException.class)
    public void testTripleLimit() {
        api = new ReadableMetadataService(ds, createURI(GRAPH), createURI(userVocabularyURI), 1);
        ds.executeWrite(() -> ds.getNamedModel(GRAPH).add(STMT1).add(STMT2));

        api.get(null, null, null, false);
    }

    @Test(expected = TooManyTriplesException.class)
    public void testTripleLimitByType() {
        api = new ReadableMetadataService(ds, createURI(GRAPH), createURI(userVocabularyURI), 1);
        setupModelForTypes();

        api.getByType(null, false);
    }

    private void setupModelForTypes() {
        Resource personConsent = createResource("http://fairspace.io/ontology#PersonConsent");
        Resource personConsentEx = createResource("http://fairspace.io/ontology#PersonConsentEx");
        Resource researchProject = createResource("http://fairspace.io/ontology#ResearchProject");
        Property targetClass = createProperty("http://www.w3.org/ns/shacl#targetClass");
        Resource personConsentShape = createProperty("http://fairspace.io/ontology#PersonConsentShape");
        Resource personConsentExShape = createProperty("http://fairspace.io/ontology#PersonConsentExShape");
        Resource researchShape = createProperty("http://fairspace.io/ontology#ResearchProjectShape");
        Resource user = createProperty("http://fairspace.io/ontology#User");
        Resource userShape = createProperty("http://fairspace.io/ontology#UserShape");

        // Setup the model
        ds.executeWrite(() -> {
            ds.getNamedModel(GRAPH)
                    .add(S1, RDF.type, personConsentEx)
                    .add(LBL_STMT1)
                    .add(S2, RDF.type, researchProject)
                    .add(createResource("http://example.com/unknown"), RDF.type, createResource("http://fairspace.io/ontology#Unknown"))
                    .add(createResource("http://example.com/person"), RDF.type, FOAF.Person)
                    .add(createResource("http://example.com/user"), RDF.type, user);

            // Mark personConsent and researchProject as fairspace entities
            ds.getNamedModel(userVocabularyURI)
                    .add(personConsentShape, targetClass, personConsent)
                    .add(personConsentExShape, targetClass, personConsentEx)
                    .add(researchShape, targetClass, researchProject)
                    .add(userShape, targetClass, user)
                    .addLiteral(userShape, FS.machineOnly, true)
                    .add(personConsentEx, RDFS.subClassOf, personConsent);
        });
    }

    private void setupImportantProperties() {
        Resource labelShape = createResource("http://labelShape");
        Resource createdByShape = createResource("http://createdByShape");
        Resource md5Shape = createResource("http://md5Shape");

        ds.getNamedModel(userVocabularyURI).add(labelShape, FS.importantProperty, createTypedLiteral(Boolean.TRUE));
        ds.getNamedModel(userVocabularyURI).add(labelShape, SHACLM.path, RDFS.label);
        ds.getNamedModel(userVocabularyURI).add(createdByShape, FS.importantProperty, createTypedLiteral(Boolean.TRUE));
        ds.getNamedModel(userVocabularyURI).add(createdByShape, SHACLM.path, FS.createdBy);
        ds.getNamedModel(userVocabularyURI).add(md5Shape, FS.importantProperty, createTypedLiteral(Boolean.FALSE));
        ds.getNamedModel(userVocabularyURI).add(md5Shape, SHACLM.path, FS.md5);
    }
}
