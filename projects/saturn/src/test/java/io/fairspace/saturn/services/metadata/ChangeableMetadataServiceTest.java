package io.fairspace.saturn.services.metadata;

import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.*;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.rdf.SparqlUtils.generateVocabularyIri;
import static io.fairspace.saturn.services.metadata.ChangeableMetadataService.NIL;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY_GRAPH_URI;
import static io.fairspace.saturn.vocabulary.Vocabularies.initVocabularies;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.sparql.core.Quad.defaultGraphIRI;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

@RunWith(MockitoJUnitRunner.class)
public class ChangeableMetadataServiceTest {
    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Resource S3 = createResource("http://localhost/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");

    private static final Statement STMT1 = createStatement(S1, P1, S2);
    private static final Statement STMT2 = createStatement(S2, P1, S3);

    private static final Node USER = createURI("http://localhost/iri/U1");

    private Dataset ds = createTxnMem();
    private RDFConnection rdf = new RDFConnectionLocal(ds, Isolation.COPY);
    private ChangeableMetadataService api;

    private MetadataEntityLifeCycleManager lifeCycleManager;

    @Before
    public void setUp() {
        initVocabularies(rdf);
        lifeCycleManager = new MetadataEntityLifeCycleManager(rdf, defaultGraphIRI, VOCABULARY_GRAPH_URI, () -> USER);
        api = new ChangeableMetadataService(rdf, defaultGraphIRI, VOCABULARY_GRAPH_URI, lifeCycleManager, new ComposedValidator());
    }

    @Test
    public void testPutWillAddStatements() {
        Model delta = createDefaultModel().add(STMT1).add(STMT2);

        api.put(delta);

        Model result = api.get(null, null, null, false);
        assertTrue(result.contains(STMT1) && result.contains(STMT2));
    }

    @Test
    public void testPutHandlesLifecycleForEntities() {
        Model delta = createDefaultModel().add(STMT1);
        api.put(delta);
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.dateCreated));
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.createdBy));;
    }


    @Test
    public void testPutWillNotRemoveExistingStatements() {
        // Prepopulate the model
        final Statement EXISTING1 = createStatement(S1, P1, S3);
        final Statement EXISTING2 = createStatement(S2, P2, createPlainLiteral("test"));
        executeWrite(ds, () -> ds.getDefaultModel().add(EXISTING1).add(EXISTING2));

        // Put new statements
        Model delta = createDefaultModel().add(STMT1).add(STMT2);
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
    public void softDelete() {
        executeWrite(ds, () -> ds.getDefaultModel().add(STMT1).add(STMT2));

        api.softDelete(S1.getURI());

        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.dateDeleted));
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.deletedBy));
        assertTrue(ds.getDefaultModel().contains(STMT1));
        assertTrue(ds.getDefaultModel().contains(STMT2));
    }

    @Test
    public void softDeleteProtectsMachineOnlyEntities() {
        var resource = createResource("http://example.com/123");
        executeWrite(ds, () -> ds.getDefaultModel().add(resource, RDF.type, FS.File));

        api.softDelete(resource.getURI());

        assertFalse(ds.getDefaultModel().contains(resource, FS.dateDeleted));
        assertFalse(ds.getDefaultModel().contains(resource, FS.deletedBy));
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
    public void patchWithNil() {
        executeWrite(ds, () -> ds.getDefaultModel().add(S1, P1, S2).add(S1, P1, S3));


        api.patch(createDefaultModel().add(S1, P1, NIL));

        assertFalse(ds.getDefaultModel().contains(S1, P1, (RDFNode) null));
    }

    @Test
    public void testPatchHandlesLifecycleForEntities() {
        Model delta = createDefaultModel().add(STMT1);
        api.patch(delta);
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.dateCreated));
        assertTrue(ds.getDefaultModel().contains(STMT1.getSubject(), FS.createdBy));
    }

    @Test
    public void testInference() {
        initVocabularies(rdf);

        var provideMaterial = createProperty(generateVocabularyIri("providesMaterial").getURI());
        var derivesFrom = createProperty(generateVocabularyIri("derivesFrom").getURI());

        api.put(createDefaultModel().add(S1, provideMaterial, S2));

        assertTrue(ds.getDefaultModel().contains(S1, provideMaterial, S2));
        assertTrue(ds.getDefaultModel().contains(S2, derivesFrom, S1));

        api.delete(createDefaultModel().add(S2, derivesFrom, S1));

        assertFalse(ds.getDefaultModel().contains(S1, provideMaterial, S2));
        assertFalse(ds.getDefaultModel().contains(S2, derivesFrom, S1));
    }
}
