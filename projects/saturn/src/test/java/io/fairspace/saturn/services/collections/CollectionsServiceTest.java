package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.CollectionAccessDeniedException;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.FolderResource;
import org.apache.jena.graph.Node;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

import static io.fairspace.saturn.auth.RequestContext.setCurrentRequest;
import static java.util.stream.Collectors.toMap;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class CollectionsServiceTest {
    private static final Node userIri = createURI("http://ex.com/user");
    private static final Node workspaceIri = createURI("http://ex.com/ws");

    @Mock
    private ResourceFactory resourceFactory;
    @Mock
    private FolderResource rootResource;
    @Mock
    private FolderResource collectionResource;
    @Mock
    private User user;
    @Mock
    private HttpServletRequest request;
    @Mock
    private PermissionsService permissions;
    private CollectionsService collections;

    @Before
    public void before() throws NotAuthorizedException, BadRequestException {
        setCurrentRequest(request);
        when(request.getAttribute(eq(User.class.getName()))).thenReturn(user);
        when(user.getIri()).thenReturn(userIri);
        when(user.getName()).thenReturn("name");
        var ds = createTxnMem();
        var transactions = new SimpleTransactions(ds);
        ds.getDefaultModel().add(ds.getDefaultModel().asRDFNode(workspaceIri).asResource(), RDF.type, FS.Workspace);
        collections = new CollectionsService("http://fairspace.io/", transactions, resourceFactory, permissions);

        when(resourceFactory.getResource(any(), any())).thenReturn(rootResource);
        when(rootResource.child(any())).thenReturn(collectionResource);
    }

    @Test
    public void serviceReturnsAnEmptyListIfNoCollectionsExist() {
        assertTrue(collections.list().isEmpty());
    }

    @Test
    public void newlyCreatedCollectionIsProperlyInitialized() {
        var prototype = newCollection();
        var created = collections.create(prototype);
        assertTrue(created.getIri().isURI());
        assertEquals(prototype.getName(), created.getName());
        assertEquals(prototype.getDescription(), created.getDescription());
        assertEquals(prototype.getLocation(), created.getLocation());
        assertEquals(prototype.getConnectionString(), created.getConnectionString());
        assertEquals(userIri.getURI(), created.getCreatedBy().getURI());
        assertNotNull(created.getDateCreated());
        assertEquals(created.getDateCreated(), created.getDateModified());
        assertEquals(Access.Manage, created.getAccess());
    }

    @Test
    public void newlyCreatedCollectionIsAccessible() {
        var created = collections.create(newCollection());
        when(permissions.getPermissions(any())).thenReturn(Map.of(created.getIri(), Access.Write));
        assertNotNull(collections.getByLocation("dir1"));
        assertNull(collections.getByLocation("dir2"));
        assertEquals(1, collections.list().size());
        assertTrue(collections.list().contains(created));

        assertEquals(created, collections.get(created.getIri().getURI()));
    }

    private Collection newCollection() {
        var c = new Collection();
        c.setName("c1");
        c.setLocation("dir1");
        c.setDescription("descr");
        c.setConnectionString("");
        c.setOwnerWorkspace(workspaceIri);
        return c;
    }

    @Test
    public void changingLocationCallsWebDAV() throws NotAuthorizedException, ConflictException, BadRequestException {
        var created1 = collections.create(newCollection());

        mockPermissions(Access.Manage);

        var patch = new Collection();
        patch.setIri(created1.getIri());
        patch.setLocation("dir2");
        collections.update(patch);
        verify(collectionResource, times(1)).moveTo(rootResource, "dir2");
    }

    @Test
    public void updatesWorkAsExpected() throws NotAuthorizedException, ConflictException, BadRequestException {
        var c = collections.create(newCollection());

        mockPermissions(Access.Manage);

        var patch = new Collection();
        patch.setIri(c.getIri());
        patch.setName("new name");
        patch.setDescription("new descr");
        patch.setLocation("dir2");

        c = collections.update(patch);

        verify(collectionResource, times(1)).moveTo(rootResource, "dir2");

        var updated = collections.get(c.getIri().getURI());
        assertEquals("new name", updated.getName());
        assertEquals("new descr", updated.getDescription());
        assertEquals("dir2", updated.getLocation());
        assertNotEquals(c.getDateModified(), updated.getDateModified());
    }


    @Test
    public void deletionEmitsAnEvent() throws NotAuthorizedException, ConflictException, BadRequestException {
        var c = collections.create(newCollection());
        doNothing().when(permissions).ensureAdmin();
        collections.delete(c.getIri().getURI());
        verify(collectionResource, times(1)).delete();
    }

    @Test
    public void standardCharactersInLocationAreAllowed() {
        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("Az_1-2");
        c1.setDescription("descr");
        c1.setConnectionString("managed://example.com");
        c1.setOwnerWorkspace(workspaceIri);

        assertEquals(c1.getLocation(), collections.create(c1).getLocation());
    }

    @Test(expected = IllegalArgumentException.class)
    public void nonStandardCharactersInLocationAreNotAllowed() {
            var c1 = new Collection();
            c1.setName("c1");
            c1.setLocation("dir?");
            c1.setDescription("descr");
            c1.setConnectionString("managed://example.com");
            c1.setOwnerWorkspace(workspaceIri);

            collections.create(c1);
    }

    @Test(expected = LocationAlreadyExistsException.class)
    public void checksForLocationsUniquenessOnCreate() {
            var c1 = new Collection();
            c1.setName("c1");
            c1.setLocation("dir1");
            c1.setDescription("descr");
            c1.setConnectionString("managed://example.com");
            c1.setOwnerWorkspace(workspaceIri);

            collections.create(c1);
            c1.setIri(null);
            collections.create(c1);
    }

    @Test(expected = LocationAlreadyExistsException.class)
    public void checksForLocationsUniquenessOnUpdate() {
            var c1 = collections.create(newCollection());

            var c2 = new Collection();
            c2.setName("c2");
            c2.setLocation("dir2");
            c2.setDescription("descr");
            c2.setConnectionString("managed://example.com");
            c2.setOwnerWorkspace(workspaceIri);

            collections.create(c2);

            var patch = new Collection();
            patch.setIri(c1.getIri());
            patch.setLocation(c2.getLocation());
            mockPermissions(Access.Manage);
            collections.update(patch);
    }

    @Test
    public void collectionsWithNonePermissionAreInvisible() {
        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir");
        c1.setDescription("descr");
        c1.setConnectionString("managed://example.com");
        c1.setOwnerWorkspace(workspaceIri);
        c1 = collections.create(c1);

        mockPermissions(Access.None);

        assertNull(collections.get(c1.getIri().getURI()));
        assertNull(collections.getByLocation(c1.getLocation()));
        assertTrue(collections.list().isEmpty());
    }

    @Test
    public void collectionsWithWritePermissionCanBeModified() {
        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir");
        c1.setDescription("descr");
        c1.setConnectionString("managed://example.com");
        c1.setOwnerWorkspace(workspaceIri);
        c1 = collections.create(c1);

        mockPermissions(Access.Write);

        c1.setDescription("new description");
        collections.update(c1);
        assertEquals("new description", collections.get(c1.getIri().getURI()).getDescription());
    }

    @Test(expected = AccessDeniedException.class)
    public void collectionsWithoutWritePermissionCannotBeModified() {
        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir");
        c1.setDescription("descr");
        c1.setConnectionString("managed://example.com");;
        c1.setOwnerWorkspace(workspaceIri);
        c1 = collections.create(c1);

        mockPermissions(Access.Read);

        c1.setDescription("new description");
        collections.update(c1);
    }

    @Test(expected = CollectionAccessDeniedException.class)
    public void collectionsWithoutAdminRoleCannotBeDeleted() {
        var c1 = collections.create(newCollection());

        doThrow(new AccessDeniedException()).when(permissions).ensureAdmin();

        collections.delete(c1.getIri().getURI());
    }

    private void mockPermissions(Access access) {
        when(permissions.getPermissions(any(java.util.Collection.class)))
                .thenAnswer(invocation -> invocation.<java.util.Collection<Node>>getArgument(0)
                        .stream()
                        .collect(toMap(node -> node, node -> access)));
        doCallRealMethod().when(permissions).getPermission(any());
    }
}
