package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.sparql.core.Quad;
import org.apache.jena.sparql.vocabulary.FOAF;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.TestUtils.isomorphic;
import static io.fairspace.saturn.rdf.SparqlUtils.generateVocabularyIri;
import static io.fairspace.saturn.services.metadata.ChangeableMetadataService.NIL;
import static io.fairspace.saturn.util.ModelUtils.modelOf;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class ChangeableMetadataServiceTest {
    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Resource S3 = createResource("http://localhost/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");

    private static final Statement STMT1 = createStatement(S1, P1, S2);
    private static final Statement STMT2 = createStatement(S2, P1, S3);


    private Dataset ds = createTxnMem();
    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);
    private ChangeableMetadataService api;

    @Mock
    private MetadataEntityLifeCycleManager lifeCycleManager;

    @Before
    public void setUp() {
        api = new ChangeableMetadataService(rdf, Quad.defaultGraphIRI, VOCABULARY_GRAPH_URI, lifeCycleManager, new ComposedValidator());
    }

    @Test
    public void testPutWillAddStatements() {
        var delta = modelOf(STMT1, STMT2);

        api.put(delta);

        Model result = api.get(null, null, null, false);
        assertTrue(result.contains(STMT1) && result.contains(STMT2));
    }

    @Test
    public void testPutHandlesLifecycleForEntitities() {
        var delta = modelOf(STMT1, STMT2);
        api.put(delta);
        verify(lifeCycleManager).updateLifecycleMetadata(isomorphic(delta));
    }


    @Test
    public void testPutWillNotRemoveExistingStatements() {
        // Prepopulate the model
        final Statement EXISTING1 = createStatement(S1, P1, S3);
        final Statement EXISTING2 = createStatement(S2, P2, createPlainLiteral("test"));
        executeWrite(ds, () -> ds.getDefaultModel().add(EXISTING1).add(EXISTING2));

        // Put new statements
        var delta = modelOf(STMT1, STMT2);
        api.put(delta);

        // Now ensure that the existing triples are still there
        // and the new ones are added
        Model model = ds.getDefaultModel();
        assertTrue(model.contains(EXISTING1));
        assertTrue(model.contains(EXISTING2));
        assertTrue(model.contains(STMT1));
        assertTrue(model.contains(STMT2));
    }

    @Test
    public void deleteModel() {
        executeWrite(ds, () -> ds.getDefaultModel().add(STMT1).add(STMT2));

        api.delete(modelOf(STMT1));

        assertFalse(ds.getDefaultModel().contains(STMT1));
        assertTrue(ds.getDefaultModel().contains(STMT2));
    }

    @Test
    public void patch() {
        executeWrite(ds, () -> ds.getDefaultModel().add(STMT1).add(STMT2));

        Statement newStmt1 = createStatement(S1, P1, S3);
        Statement newStmt2 = createStatement(S2, P1, S1);
        Statement newStmt3 = createStatement(S1, P2, S3);

        api.patch(modelOf(newStmt1, newStmt2, newStmt3));
        assertTrue(ds.getDefaultModel().contains(newStmt1));
        assertTrue(ds.getDefaultModel().contains(newStmt2));
        assertTrue(ds.getDefaultModel().contains(newStmt3));
        assertFalse(ds.getDefaultModel().contains(STMT1));
        assertFalse(ds.getDefaultModel().contains(STMT2));
    }

    @Test
    public void patchWithNil() {
        executeWrite(ds, () -> ds.getDefaultModel().add(S1, P1, S2).add(S1, P1, S3));


        api.patch(createDefaultModel().add(S1, P1, NIL));

        assertFalse(ds.getDefaultModel().contains(S1, P1));
    }

    @Test
    public void testPatchHandlesLifecycleForEntities() {
        var delta = modelOf(STMT1, STMT2);
        api.patch(delta);
        verify(lifeCycleManager).updateLifecycleMetadata(isomorphic(delta));
    }

    @Test
    public void testInference() {
        initVocabularies(rdf);
        ds.getDefaultModel()
                .add(S1, RDF.type, FOAF.Person)
                .add(S2, RDF.type, createResource(generateVocabularyIri("PersonConsent").getURI()));

        var gaveConsent = createProperty(generateVocabularyIri("gaveConsent").getURI());
        var isConsentOf = createProperty(generateVocabularyIri("isConsentOf").getURI());

        api.put(modelOf(S1, gaveConsent, S2));

        assertTrue(ds.getDefaultModel().contains(S1, gaveConsent, S2));
        assertTrue(ds.getDefaultModel().contains(S2, isConsentOf, S1));

        api.delete(modelOf(S2, isConsentOf, S1));

        assertFalse(ds.getDefaultModel().contains(S1, gaveConsent, S2));
        assertFalse(ds.getDefaultModel().contains(S2, isConsentOf, S1));
    }
}
