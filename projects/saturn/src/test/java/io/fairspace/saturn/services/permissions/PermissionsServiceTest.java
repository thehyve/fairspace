package io.fairspace.saturn.services.permissions;

import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// TODO: Add more tests
@RunWith(MockitoJUnitRunner.class)
public class PermissionsServiceTest {
    private static final Node RESOURCE = createURI("http://example.com/resource");
    private static final Node RESOURCE2 = createURI("http://example.com/resource2");
    private static final Node USER1 = createURI("http://example.com/user1");
    private static final Node USER2 = createURI("http://example.com/user2");
    private static final Node USER3 = createURI("http://example.com/user3");
    private static final Node COLLECTION_1 = createURI("http://example.com/collections/collection1");
    private static final Node COLLECTION_2 = createURI("http://example.com/collections/collection2");
    private static final Node FILE_1 = createURI("http://example.com/collections/collection1/file1");
    private static final Node FILE_2 = createURI("http://example.com/collections/collection2/file2");

    private Dataset ds;
    private PermissionsService service;

    @Mock
    private PermissionChangeEventHandler permissionChangeEventHandler;

    @Mock
    private User currentUser;

    private Node currentUserIri = USER1;


    @Before
    public void setUp() {
        ds = createTxnMem();
        ds.getDefaultModel().add(createResource(RESOURCE.getURI()), RDFS.label, "LABEL");

        setupRequestContext();

        service = new PermissionsService(new SimpleTransactions(ds), permissionChangeEventHandler, "http://example.com/collections/");
        service.createResource(RESOURCE);
    }

    @Test
    public void testCreateResource() {
        assertEquals(Access.Manage, service.getPermission(RESOURCE));
    }

    @Test
    public void testCreateResources() {
        service.createResources(
                List.of(RESOURCE, RESOURCE2)
                        .stream()
                        .map(node -> ResourceFactory.createResource(node.getURI()))
                        .collect(Collectors.toList())
        );

        assertEquals(Access.Manage, service.getPermission(RESOURCE));
        assertEquals(Access.Manage, service.getPermission(RESOURCE2));
    }

    @Test
    public void testSetPermissionForACollection() {
        ds.getDefaultModel().add(createResource(RESOURCE.getURI()), RDF.type, createResource("http://fairspace.io/ontology#Collection"));
        assertNull(service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.Write);

        verify(permissionChangeEventHandler).onPermissionChange(currentUserIri, RESOURCE, USER2, Access.Write);

        assertEquals(Access.Write, service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.None);
        assertNull(service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER3, Access.Manage);
        assertEquals(Access.Manage, service.getPermissions(RESOURCE).get(USER3));
    }


    @Test(expected = IllegalArgumentException.class)
    public void testMetadataEntitiesCannotHaveReadPermissions() {
        service.setPermission(RESOURCE, USER2, Access.Read);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testMetadataEntitiesMustBeMarkedAsRestrictedBeforeGrantingWritePermissions() {
        service.setPermission(RESOURCE, USER2, Access.Write);
    }

    @Test
    public void testGettingPermissionsForFiles() {
        var collection = createResource("http://example.com/collections/collection");
        var file = createResource("http://example.com/collections/collection/file");
        ds.getDefaultModel()
                .add(collection, RDF.type, FS.Collection)
                .add(file, RDF.type, FS.File);


        service.createResource(collection.asNode());

        assertEquals(Access.Manage, service.getPermission(file.asNode()));
    }

    @Test
    public void testDefaultPermissionForCollections() {
        var coll = createResource("http://example.com/collection");
        ds.getDefaultModel().add(coll, RDF.type, FS.Collection);
        assertEquals(Access.None, service.getPermission(coll.asNode()));
    }

    @Test
    public void testDefaultPermissionForRegularEntities() {
        var entity = createResource("http://example.com/entity");
        ds.getDefaultModel().add(entity, RDF.type, createResource("http://fairspace.io/ontology#Entity"));
        assertEquals(Access.Write, service.getPermission(entity.asNode()));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testUserCannotModifyHisOwnPermission() {
        service.setPermission(RESOURCE, USER1, Access.Write);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testMetadataEntitiesCannotBeMarkedAsReadOnly() {
        service.setPermission(RESOURCE, USER2, Access.Read);
    }

    @Test
    public void testCanGrantPermissionsOnCollections() {
        ds.getDefaultModel().add(createResource(RESOURCE.getURI()), RDF.type, FS.Collection);
        assertFalse(service.getPermissions(RESOURCE).containsKey(USER2));
        service.setPermission(RESOURCE, USER2, Access.Read);
        assertEquals(Access.Read, service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.Write);
        assertEquals(Access.Write, service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.None);
        assertFalse(service.getPermissions(RESOURCE).containsKey(USER2));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testWriteAccessToEntitiesCanNotBeGrantedBeforeMarkingThemRestricted() {
        service.setPermission(RESOURCE, USER2, Access.Write);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testSettingPermissionToNoneIfNoPermissionIsPresent() {
        service.setPermission(RESOURCE, USER2, Access.None);
    }

    @Test(expected = AccessDeniedException.class)
    public void testCannotSetPermission() {
        service.setPermission(createURI("http://example.com/not-my-resource"), USER1, Access.Write);
    }

    @Test
    public void testEnsureAccessForNodesUser1() {
        setupAccessCheckForMultipleNodes();

        service.ensureAccess(Set.of(COLLECTION_1, COLLECTION_2, FILE_1, FILE_2), Access.Read);
        service.ensureAccess(Set.of(COLLECTION_1, COLLECTION_2, FILE_1, FILE_2), Access.Write);
        service.ensureAccess(Set.of(COLLECTION_1, COLLECTION_2, FILE_1, FILE_2), Access.Manage);
    }

    @Test
    public void testEnsureAccessToVisibleCollections() {
        setupAccessCheckForMultipleNodes();

        currentUserIri = USER2;

        service.ensureAccess(Set.of(COLLECTION_2, FILE_2), Access.Read);
        service.ensureAccess(Set.of(COLLECTION_2, FILE_2), Access.Write);
    }

    @Test(expected = MetadataAccessDeniedException.class)
    public void testEnsureAccessToCollections() {
        setupAccessCheckForMultipleNodes();

        currentUserIri = USER2;

        service.ensureAccess(Set.of(COLLECTION_1, COLLECTION_2, FILE_2), Access.Read);
    }

    @Test(expected = MetadataAccessDeniedException.class)
    public void testEnsureAccessToFiles() {
        setupAccessCheckForMultipleNodes();

        currentUserIri = USER2;

        service.ensureAccess(Set.of(FILE_1), Access.Read);
        service.ensureAccess(Set.of(COLLECTION_2), Access.Read);
        service.ensureAccess(Set.of(FILE_2), Access.Read);
        service.ensureAccess(Set.of(FILE_1, COLLECTION_2, FILE_2), Access.Read);
    }

    @Test
    public void testEnsureAccessToNonRestrictedEntities() {
        setupAccessCheckForMultipleNodes();

        currentUserIri = USER2;

        service.ensureAccess(Set.of(RESOURCE, RESOURCE2), Access.Read);
    }


    @Test
    public void testSetPermissionForAWorkspace() {
        ds.getDefaultModel().add(createResource(RESOURCE.getURI()), RDF.type, createResource("http://fairspace.io/ontology#Workspace"));
        assertNull(service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.Write);

        verify(permissionChangeEventHandler).onPermissionChange(currentUserIri, RESOURCE, USER2, Access.Write);

        assertEquals(Access.Write, service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER2, Access.None);
        assertNull(service.getPermissions(RESOURCE).get(USER2));
        service.setPermission(RESOURCE, USER3, Access.Manage);
        assertEquals(Access.Manage, service.getPermissions(RESOURCE).get(USER3));
    }

    @Test
    public void getPermissionsForOrganisationAdmins() {
        when(currentUser.isAdmin()).thenReturn(true);

        assertEquals(
                Map.of(
                        RESOURCE, Access.Manage,
                        RESOURCE2, Access.Manage
                ),
                service.getPermissions(Set.of(RESOURCE, RESOURCE2))
        );
    }

    @Test(expected = AccessDeniedException.class)
    public void testEnsureAdmin() {
        when(currentUser.isAdmin()).thenReturn(false);
        service.ensureAdmin();
    }

    @Test(expected = MetadataAccessDeniedException.class)
    public void testEnsureRemoveMetadataAccess() {
        when(currentUser.isAdmin()).thenReturn(false);
        Resource c1 = createResource(COLLECTION_1.getURI());
        ds.getDefaultModel().add(c1, RDF.type, FS.Collection);
        service.ensureAdminAccess(c1.asNode());
    }

    @Test(expected = MetadataAccessDeniedException.class)
    public void testEnsureRemoveWorkspaceMetadataWithNoManagePermission() {
        when(currentUser.isAdmin()).thenReturn(false);
        Resource w1 = createResource("http://fairspace.io/ontology#Workspace");
        service.setPermission(w1.asNode(), USER2, Access.Write);
        service.ensureAccess(Set.of(w1.asNode()), Access.Manage);
    }

    @Test
    public void testEnsureRemoveWorkspaceMetadataAccess() {
        when(currentUser.isAdmin()).thenReturn(true);
        Resource w1 = createResource("http://fairspace.io/ontology#Workspace");
        ds.getDefaultModel().add(w1, RDF.type, FS.Workspace);

        service.setPermission(w1.asNode(), USER2, Access.Manage);
        when(currentUser.isAdmin()).thenReturn(false);
        currentUserIri = USER2;

        try {
            service.ensureAccess(Set.of(w1.asNode()), Access.Manage);
        } catch(Exception e) {
            fail("Should not have thrown any exception");
        }
    }

    @Test
    public void testReturnedSubjectInEnsureAccessException() {
        setupAccessCheckForMultipleNodes();

        currentUserIri = USER2;

        // The exception thrown by ensureAccess should return the failing entity
        try {
            service.ensureAccess(Set.of(RESOURCE2, RESOURCE), Access.Manage);
            fail();
        } catch(MetadataAccessDeniedException e) {
            assertEquals(RESOURCE, e.getSubject());
        }

        // The exception thrown by ensureAccess should return the failing entity
        // also when it has been verified by authority
        try {
            service.ensureAccess(Set.of(FILE_1), Access.Read);
            fail();
        } catch(MetadataAccessDeniedException e) {
            assertEquals(FILE_1, e.getSubject());
        }

    }

    private void setupAccessCheckForMultipleNodes() {
        Resource c1 = createResource(COLLECTION_1.getURI());
        Resource c2 = createResource(COLLECTION_2.getURI());
        Resource f1 = createResource(FILE_1.getURI());
        Resource f2 = createResource(FILE_2.getURI());

        // Setup:
        //   COLLECTION_1 only visible and writable to USER1
        //   COLLECTION_2 also visible and writable to USER2
        //   resource owned by user1 and write-restricted
        //   resource2 owned by user1 and freely-accessible
        ds.getDefaultModel()
                .add(c1, RDF.type, FS.Collection)
                .add(c1, RDF.type, FS.Collection)
                .add(f1, RDF.type, FS.File)
                .add(c2, RDF.type, FS.Collection).add(f2, RDF.type, FS.File);

        service.createResource(COLLECTION_1);
        service.createResource(COLLECTION_2);

        service.setPermission(COLLECTION_2, USER2, Access.Write);
    }
}
