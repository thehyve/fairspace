package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.TestUtils.setAdminFlag;
import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class WorkspaceServiceTest {
    private static final Resource WORKSPACE_1 = createResource("http://localhost/iri/W1");
    private static final Resource EMPTY_WORKSPACE = createResource("http://localhost/iri/W2");
    private static final Resource COLLECTION_1 = createResource("http://localhost/iri/C1");
    private static final Resource RESOURCE_1 = createResource("http://localhost/iri/R1");
    private static final Property PROPERTY_1 = createProperty("http://fairspace.io/ontology/P1");
    private static final Resource RESOURCE_2 = createResource("http://localhost/iri/R2");
    private static final Property PROPERTY_2 = createProperty("http://fairspace.io/ontology/P2");

    private Transactions txn = new SimpleTransactions(createTxnMem());
    private WorkspaceService service;

    @Before
    public void setUp() {
        setupRequestContext();
        service = new WorkspaceService(txn);

        txn.executeWrite(ds -> ds.getDefaultModel()
                .add(WORKSPACE_1, RDF.type, FS.Workspace)
                .add(EMPTY_WORKSPACE, RDF.type, FS.Workspace)
                .add(COLLECTION_1, RDF.type, FS.Collection)
                .add(COLLECTION_1, FS.ownedBy, WORKSPACE_1)
                .add(WORKSPACE_1, PROPERTY_1, RESOURCE_1)
                .add(EMPTY_WORKSPACE, PROPERTY_2, RESOURCE_2)
        );
    }

    @Test
    public void testDeleteEmptyWorkspace() {
        setAdminFlag(true);
        service.deleteWorkspace(createURI(EMPTY_WORKSPACE.getURI()));

        txn.executeRead(ds -> {
            assertFalse(ds.getDefaultModel().contains(EMPTY_WORKSPACE, PROPERTY_2, RESOURCE_2));
            assertFalse(ds.getDefaultModel().containsResource(EMPTY_WORKSPACE));
        });
    }

    @Test(expected = AccessDeniedException.class)
    public void testDeleteEmptyWorkspaceNoPermission() {
        setAdminFlag(false);
        service.deleteWorkspace(createURI(EMPTY_WORKSPACE.getURI()));
    }

    @Test
    public void testDeleteNonWorkspaceResource() {
        setAdminFlag(true);
        try {
            service.deleteWorkspace(createURI(RESOURCE_1.getURI()));
            fail();
        } catch(IllegalArgumentException e) {
            assertEquals("Invalid resource type", e.getMessage());
        }
    }

    @Test
    public void testDeleteNonEmptyWorkspace() {
        setAdminFlag(true);
        try {
            service.deleteWorkspace(createURI(WORKSPACE_1.getURI()));
            fail();
        } catch(IllegalArgumentException e) {
            assertEquals("Workspace is not empty", e.getMessage());
        }
    }
}
