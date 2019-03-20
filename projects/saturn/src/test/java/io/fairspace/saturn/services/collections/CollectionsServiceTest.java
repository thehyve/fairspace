package io.fairspace.saturn.services.collections;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.AccessDeniedException;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.graph.Node;
import org.apache.jena.rdfconnection.RDFConnection;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.function.Supplier;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class CollectionsServiceTest {
    private RDFConnection rdf;
    private CollectionsService collections;
    @Mock
    private EventBus eventBus;
    @Mock
    private PermissionsService permissions;

    @Before
    public void before() {
        rdf = connect(createTxnMem());
        Supplier<Node> userIriSupplier = () -> createURI("http://example.com/user");
        collections = new CollectionsService(new DAO(rdf, userIriSupplier), eventBus, permissions);
    }

    @Test
    public void basicFunctionality() throws InterruptedException {
        assertTrue(collections.list().isEmpty());

        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir1");
        c1.setDescription("descr");
        c1.setType("LOCAL");

        var created1 = collections.create(c1);

        verify(permissions).createResource(created1.getIri());
        when(permissions.getPermission(eq(created1.getIri()))).thenReturn(Access.Manage);

        verify(eventBus, times(1)).post(new CollectionCreatedEvent(created1));
        assertTrue(created1.getIri().isURI());
        assertEquals(c1.getName(), created1.getName());
        assertEquals(c1.getDescription(), created1.getDescription());
        assertEquals(c1.getLocation(), created1.getLocation());
        assertEquals(c1.getType(), created1.getType());
        assertEquals("http://example.com/user", created1.getCreatedBy().getURI());
        assertNotNull(created1.getDateCreated());
        assertEquals(created1.getDateCreated(), created1.getDateModified());

        assertNotNull(collections.getByLocation("dir1"));
        assertNull(collections.getByLocation("dir2"));

        assertEquals(1, collections.list().size());
        assertTrue(collections.list().contains(created1));

        assertEquals(created1, collections.get(created1.getIri().getURI()));


        var patch = new Collection();
        patch.setIri(created1.getIri());
        patch.setName("new name");
        patch.setDescription("new descr");
        patch.setLocation("dir2");
        collections.update(patch);
        verify(eventBus, times(1)).post(new CollectionMovedEvent(created1, "dir1"));

        var updated1 = collections.get(created1.getIri().getURI());
        assertEquals("new name", updated1.getName());
        assertEquals("new descr", updated1.getDescription());
        assertEquals("dir2", updated1.getLocation());
        assertNotEquals(created1.getDateModified(), updated1.getDateModified());

        Thread.sleep(100);
        patch.setDescription("Description");
        collections.update(patch);
        var updated2 = collections.get(created1.getIri().getURI());
        assertNotEquals(updated1.getDateModified(), updated2.getDateModified());

        var c2 = new Collection();
        c2.setName("c2");
        c2.setLocation("dir3");
        c2.setDescription("blah");
        c2.setType("LOCAL");
        var created2 = collections.create(c2);
        verify(permissions).createResource(created2.getIri());
        when(permissions.getPermission(eq(created2.getIri()))).thenReturn(Access.Manage);
        assertEquals(2, collections.list().size());

        collections.delete(created2.getIri().getURI());
        assertEquals(1, collections.list().size());
        verify(eventBus, times(1)).post(new CollectionDeletedEvent(created2));
    }

    @Test
    public void standardCharactersInLocationAreAllowed() {
        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("Az_1-2");
        c1.setDescription("descr");
        c1.setType("LOCAL");

        assertEquals(c1.getLocation(), collections.create(c1).getLocation());
    }

    @Test(expected = IllegalArgumentException.class)
    public void nonStandardCharactersInLocationAreNotAllowed() {
        try {
            var c1 = new Collection();
            c1.setName("c1");
            c1.setLocation("dir?");
            c1.setDescription("descr");
            c1.setType("LOCAL");

            collections.create(c1);
        } finally {
            verifyNoMoreInteractions(eventBus);
        }
    }

    @Test(expected = LocationAlreadyExistsException.class)
    public void checksForLocationsUniquenessOnCreate() {
        try {
            var c1 = new Collection();
            c1.setName("c1");
            c1.setLocation("dir1");
            c1.setDescription("descr");
            c1.setType("LOCAL");

            collections.create(c1);
            c1.setIri(null);
            collections.create(c1);
        } finally {
            verify(eventBus, times(1)).post(any(CollectionCreatedEvent.class));
            verifyNoMoreInteractions(eventBus);
        }
    }

    @Test(expected = LocationAlreadyExistsException.class)
    public void checksForLocationsUniquenessOnUpdate() {
        try {
            var c1 = new Collection();
            c1.setName("c1");
            c1.setLocation("dir1");
            c1.setDescription("descr");
            c1.setType("LOCAL");

            c1 = collections.create(c1);

            var c2 = new Collection();
            c2.setName("c2");
            c2.setLocation("dir2");
            c2.setDescription("descr");
            c2.setType("LOCAL");

            collections.create(c2);

            var patch = new Collection();
            patch.setIri(c1.getIri());
            patch.setLocation(c2.getLocation());
            when(permissions.getPermission(eq(c1.getIri()))).thenReturn(Access.Manage);
            collections.update(patch);
        } finally {
            verify(eventBus, times(2)).post(any(CollectionCreatedEvent.class));
            verifyNoMoreInteractions(eventBus);
        }
    }

    @Test
    public void collectionsWithNonePermissionAreInvisible() {
        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir");
        c1.setDescription("descr");
        c1.setType("LOCAL");
        c1 = collections.create(c1);

        when(permissions.getPermission(eq(c1.getIri()))).thenReturn(Access.None);

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
        c1.setType("LOCAL");
        c1 = collections.create(c1);

        when(permissions.getPermission(eq(c1.getIri()))).thenReturn(Access.Write);

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
        c1.setType("LOCAL");
        c1 = collections.create(c1);

        when(permissions.getPermission(eq(c1.getIri()))).thenReturn(Access.Read);

        c1.setDescription("new description");
        collections.update(c1);
    }

    @Test(expected = AccessDeniedException.class)
    public void collectionsWithoutManagePermissionCannotBeDeleted() {
        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir");
        c1.setDescription("descr");
        c1.setType("LOCAL");
        c1 = collections.create(c1);

        when(permissions.getPermission(eq(c1.getIri()))).thenReturn(Access.Write);

        collections.delete(c1.getIri().getURI());
    }
}
