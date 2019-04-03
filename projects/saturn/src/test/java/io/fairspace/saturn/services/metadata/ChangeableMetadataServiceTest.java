package io.fairspace.saturn.services.metadata;

import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.system.Txn.executeWrite;
import static org.junit.Assert.*;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class ChangeableMetadataServiceTest {
    private static final String GRAPH = "http://localhost/iri/graph";

    private static final Resource S1 = createResource("http://localhost/iri/S1");
    private static final Resource S2 = createResource("http://localhost/iri/S2");
    private static final Resource S3 = createResource("http://localhost/iri/S3");
    private static final Property P1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Property P2 = createProperty("http://fairspace.io/ontology/P2");

    private static final Statement STMT1 = createStatement(S1, P1, S2);
    private static final Statement STMT2 = createStatement(S2, P1, S3);


    private Dataset ds;
    private ChangeableMetadataService api;

    @Mock
    private MetadataEntityLifeCycleManager lifeCycleManager;

    @Before
    public void setUp() {
        ds = createTxnMem();
        api = new ChangeableMetadataService(new RDFConnectionLocal(ds), createURI(GRAPH), lifeCycleManager,null);
    }

    @Test
    public void testPutWillAddStatements() {
        Model delta = createDefaultModel().add(STMT1).add(STMT2);

        api.put(delta);

        Model result = api.get(null, null, null, false);
        assertTrue(result.contains(STMT1) && result.contains(STMT2));
    }

    @Test
    public void testPutHandlesLifecycleForEntitities() {
        Model delta = createDefaultModel().add(STMT1).add(STMT2);
        api.put(delta);
        verify(lifeCycleManager).updateLifecycleMetadata(delta);
    }


    @Test
    public void testPutWillNotRemoveExistingStatements() {
        // Prepopulate the model
        final Statement EXISTING1 = createStatement(S1, P1, S3);
        final Statement EXISTING2 = createStatement(S2, P2, createPlainLiteral("test"));
        executeWrite(ds, () -> ds.getNamedModel(GRAPH).add(EXISTING1).add(EXISTING2));

        // Put new statements
        Model delta = createDefaultModel().add(STMT1).add(STMT2);
        api.put(delta);

        // Now ensure that the existing triples are still there
        // and the new ones are added
        Model model = ds.getNamedModel(GRAPH);
        assertTrue(model.contains(EXISTING1));
        assertTrue(model.contains(EXISTING2));
        assertTrue(model.contains(STMT1));
        assertTrue(model.contains(STMT2));
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
    public void testPatchHandlesLifecycleForEntities() {
        Model delta = createDefaultModel().add(STMT1).add(STMT2);
        api.patch(delta);
        verify(lifeCycleManager).updateLifecycleMetadata(delta);
    }
}
