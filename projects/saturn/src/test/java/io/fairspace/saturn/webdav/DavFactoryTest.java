package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Request;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.*;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.io.InputStream;

import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class DavFactoryTest {
    public static final long FILE_SIZE = 3L;
    public static final String BASE_PATH = "/api/v1/webdav/";
    public static final QName VERSION = new QName(FS.NS, "version");
    private final String baseUri = "http://example.com/" + BASE_PATH;
    @Mock
    private PermissionsService permissions;
    @Mock
    BlobStore store;
    @Mock
    InputStream input;
    private org.eclipse.jetty.server.Request request;

    private ResourceFactory factory;

    @Before
    public void before() {
        factory = new DavFactory(baseUri, createTxnMem().getDefaultModel(), store, permissions);

        setupRequestContext();
        request = getCurrentRequest();
        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", 3, "md5"));

        when(permissions.getPermission(any())).thenReturn(Access.Manage);
    }


    @Test
    public void testRoot() throws NotAuthorizedException, BadRequestException {
        var root = factory.getResource(null, BASE_PATH);

        assertTrue(root instanceof MakeCollectionableResource);
        assertFalse(root instanceof PutableResource);
    }

    @Test
    public void testCreateCollection() throws NotAuthorizedException, BadRequestException, ConflictException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = root.createCollection("coll");
        assertTrue(coll instanceof FolderResource);
        assertEquals("coll", coll.getName());
        assertNotNull(root.child("coll"));
        assertNotNull(factory.getResource(null,"/api/v1/webdav/coll/"));
        assertEquals(1, root.getChildren().size());
    }

    @Test
    public void testNonExistingResource() throws NotAuthorizedException, BadRequestException, ConflictException {
        assertNull(factory.getResource(null, BASE_PATH + "coll/dir/file"));
    }

    @Test(expected = NotAuthorizedException.class)
    public void testInaccessibleResource() throws NotAuthorizedException, BadRequestException, ConflictException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = root.createCollection("coll");

        when(permissions.getPermission(any())).thenReturn(Access.None);

        factory.getResource(null, BASE_PATH + "coll");
    }

    @Test(expected = ConflictException.class)
    public void testCreateCollectionTwice() throws NotAuthorizedException, BadRequestException, ConflictException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        root.createCollection("coll");
        root.createCollection("coll");
    }

    @Test
    public void testCreateDirectory() throws NotAuthorizedException, BadRequestException, ConflictException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");
        var dir = coll.createCollection("dir");
        assertNotNull(dir);
        assertEquals("dir", dir.getName());
        assertEquals(1, coll.getChildren().size());
    }

    @Test
    public void testCreateFile() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");

        verifyNoInteractions(input, store);

        assertNotNull(factory.getResource(null, BASE_PATH + "/coll/file"));

        assertTrue(file instanceof GetableResource);
        assertEquals("file", file.getName());
        assertEquals(FILE_SIZE, ((GetableResource)file).getContentLength().longValue());
        assertEquals("text/abc", ((GetableResource)file).getContentType(BASE_PATH));

        assertTrue(file instanceof MultiNamespaceCustomPropertyResource);

        assertEquals(1, ((MultiNamespaceCustomPropertyResource) file).getProperty(VERSION));
    }

    @Test
    public void testReadOnlyCollection() throws NotAuthorizedException, BadRequestException, ConflictException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        root.createCollection("coll");

        when(permissions.getPermission(any())).thenReturn(Access.Read);

        assertFalse(root.child("coll").authorise(null, Request.Method.PUT, null));
    }

    @Test
    public void testOverwriteFile() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");

        assertTrue(file instanceof ReplaceableResource);

        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", FILE_SIZE + 1, "md5"));
        ((ReplaceableResource) file).replaceContent(input, FILE_SIZE + 1);

        verifyNoInteractions(input, store);

        var file2 = coll.child("file");
        assertEquals(2, ((MultiNamespaceCustomPropertyResource) file2).getProperty(VERSION));
        assertEquals(FILE_SIZE + 1, ((GetableResource)file2).getContentLength().longValue());
    }

    @Test
    public void testGetVersion() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");

        assertTrue(file instanceof ReplaceableResource);

        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", FILE_SIZE + 1, "md5"));
        ((ReplaceableResource) file).replaceContent(input, FILE_SIZE + 1);

        when(request.getHeader("Version")).thenReturn("1");
        var ver1 = coll.child("file");
        assertEquals(1, ((MultiNamespaceCustomPropertyResource) ver1).getProperty(VERSION));
        assertEquals(FILE_SIZE, ((GetableResource)ver1).getContentLength().longValue());

        when(request.getHeader("Version")).thenReturn("2");
        var ver2 = coll.child("file");
        assertEquals(2, ((MultiNamespaceCustomPropertyResource) ver2).getProperty(VERSION));
        assertEquals(FILE_SIZE + 1, ((GetableResource)ver2).getContentLength().longValue());
    }

    @Test
    public void testRevert() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");

        assertTrue(file instanceof ReplaceableResource);

        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", FILE_SIZE + 1, "md5"));
        ((ReplaceableResource) file).replaceContent(input, FILE_SIZE + 1);

        ((MultiNamespaceCustomPropertyResource)coll.child("file")).setProperty(VERSION, 1);

        var ver3 = coll.child("file");
        assertEquals(3, ((MultiNamespaceCustomPropertyResource) ver3).getProperty(VERSION));
        assertEquals(FILE_SIZE, ((GetableResource)ver3).getContentLength().longValue());
    }

    @Test
    public void testDeleteFile() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");
        assertTrue(file instanceof DeletableResource);
        ((DeletableResource)file).delete();

        verifyNoInteractions(input, store);

        assertEquals(0, coll.getChildren().size());
        assertNull(coll.child("file"));
    }

    @Test
    public void testShowDeletedFiles() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");
        assertTrue(file instanceof DeletableResource);
        ((DeletableResource)file).delete();

        when(request.getHeader("Show-Deleted")).thenReturn("on");

        assertEquals(1, coll.getChildren().size());
        assertNotNull(coll.child("file"));

        var deleted = (MultiNamespaceCustomPropertyResource) coll.child("file");

        assertNotNull(deleted.getProperty(new QName(FS.NS, "dateDeleted")));
    }

    @Test
    public void testRestoreDeletedFiles() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");
        assertTrue(file instanceof DeletableResource);
        ((DeletableResource)file).delete();

        when(request.getHeader("Show-Deleted")).thenReturn("on");
        var deleted = (MultiNamespaceCustomPropertyResource) coll.child("file");

        deleted.setProperty(new QName(FS.NS, "dateDeleted"), null);

        var restored = (MultiNamespaceCustomPropertyResource) coll.child("file");
        assertNull(restored.getProperty(new QName(FS.NS, "dateDeleted")));
    }

    @Test
    public void testPurgeFile() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");
        assertTrue(file instanceof DeletableResource);
        ((DeletableResource)file).delete();

        when(request.getHeader("Show-Deleted")).thenReturn("on");

        assertEquals(1, coll.getChildren().size());
        assertNotNull(coll.child("file"));

        var deleted = (DeletableResource) coll.child("file");
        deleted.delete();


        assertNull(coll.child("file"));
    }

    @Test
    public void testRenameFile() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("old", input, FILE_SIZE, "text/abc");

        ((MoveableResource) file).moveTo(coll, "new");

        assertEquals(1, coll.getChildren().size());
        assertNull(coll.child("old"));
        assertNotNull(coll.child("new"));
    }

    @Test
    public void testRenameDirectory() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var dir = coll.createCollection("old");
        ((FolderResource) dir).createNew("file", input, FILE_SIZE, "text/abc");

        ((MoveableResource) dir).moveTo(coll, "new");

        assertEquals(1, coll.getChildren().size());
        assertNull(coll.child("old"));
        assertNotNull(coll.child("new"));

        assertNull(factory.getResource(null, BASE_PATH + "/coll/old/file"));
        assertNotNull(factory.getResource(null, BASE_PATH + "/coll/new/file"));
    }

    @Test
    public void testRenameCollection() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll = (FolderResource) root.createCollection("old");

        var dir = coll.createCollection("dir");
        ((FolderResource) dir).createNew("file", input, FILE_SIZE, "text/abc");

        coll.moveTo(root, "new");

        assertNull(factory.getResource(null, BASE_PATH + "/old"));
        assertNotNull(factory.getResource(null, BASE_PATH + "/new"));
        assertNull(factory.getResource(null, BASE_PATH + "/old/dir"));
        assertNotNull(factory.getResource(null, BASE_PATH + "/new/dir"));
        assertNull(factory.getResource(null, BASE_PATH + "/old/dir/file"));
        assertNotNull(factory.getResource(null, BASE_PATH + "/new/dir/file"));
    }

    @Test
    public void testCopyDirectory() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, BASE_PATH);
        var coll1 = (FolderResource) root.createCollection("c1");
        var coll2 = (FolderResource) root.createCollection("c2");

        var dir1 = (MakeCollectionableResource) coll1.createCollection("dir1");
        var subdir = dir1.createCollection("old");
        ((FolderResource) subdir).createNew("file", input, FILE_SIZE, "text/abc");


        var dir2 = coll2.createCollection("dir2");

        ((MoveableResource) subdir).moveTo(dir2, "new");

        assertNull(factory.getResource(null, BASE_PATH + "/c1/dir1/old"));
        assertNotNull(factory.getResource(null, BASE_PATH + "/c2/dir2/new"));
        assertNotNull(factory.getResource(null, BASE_PATH + "/c2/dir2/new/file"));
    }
}