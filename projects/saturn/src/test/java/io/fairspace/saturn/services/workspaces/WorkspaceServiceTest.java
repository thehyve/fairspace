package io.fairspace.saturn.services.workspaces;

import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.mail.Session;

import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

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
    @Mock
    Session session;
    @Mock
    private UserService userService;
    User user = new User();

    @Before
    public void setUp() {
        setupRequestContext();
        when(userService.currentUser()).thenReturn(user);
        service = new WorkspaceService(txn, userService);

        txn.executeWrite(model -> model
                .add(WORKSPACE_1, RDF.type, FS.Workspace)
                .add(EMPTY_WORKSPACE, RDF.type, FS.Workspace)
                .add(COLLECTION_1, RDF.type, FS.Collection)
                .add(COLLECTION_1, FS.ownedBy, WORKSPACE_1)
                .add(COLLECTION_1, FS.belongsTo, WORKSPACE_1)
                .add(WORKSPACE_1, PROPERTY_1, RESOURCE_1)
                .add(EMPTY_WORKSPACE, PROPERTY_2, RESOURCE_2)
        );
    }

    @Test
    public void testDeleteEmptyWorkspace() {
        user.setAdmin(true);
        service.deleteWorkspace(createURI(EMPTY_WORKSPACE.getURI()));

        txn.executeRead(model -> {
            assertFalse(model.contains(EMPTY_WORKSPACE, PROPERTY_2, RESOURCE_2));
            assertFalse(model.containsResource(EMPTY_WORKSPACE));
        });
    }

    @Test(expected = AccessDeniedException.class)
    public void testDeleteEmptyWorkspaceNoPermission() {
        service.deleteWorkspace(createURI(EMPTY_WORKSPACE.getURI()));
    }

    @Test
    public void testDeleteNonWorkspaceResource() {
        user.setAdmin(true);
        try {
            service.deleteWorkspace(createURI(RESOURCE_1.getURI()));
            fail();
        } catch(IllegalArgumentException e) {
            assertEquals("Invalid resource type", e.getMessage());
        }
    }

    @Test
    public void testDeleteNonEmptyWorkspace() {
        user.setAdmin(true);
        try {
            service.deleteWorkspace(createURI(WORKSPACE_1.getURI()));
            fail();
        } catch(IllegalArgumentException e) {
            assertEquals("Workspace is not empty", e.getMessage());
        }
    }
}
