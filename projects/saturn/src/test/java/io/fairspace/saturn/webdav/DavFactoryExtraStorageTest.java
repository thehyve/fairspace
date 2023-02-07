package io.fairspace.saturn.webdav;

import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.webdav.blobstore.BlobInfo;
import io.fairspace.saturn.webdav.blobstore.BlobStore;
import io.fairspace.saturn.webdav.blobstore.DeletableLocalBlobStore;
import io.fairspace.saturn.webdav.resources.DirectoryResource;
import io.fairspace.saturn.webdav.resources.ExtraStorageRootResource;
import io.fairspace.saturn.webdav.resources.FileResource;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.*;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.sparql.util.Context;
import org.eclipse.jetty.server.Authentication;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.io.InputStream;

import static io.fairspace.saturn.TestUtils.*;
import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static java.lang.String.format;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class DavFactoryExtraStorageTest {
    static final long FILE_SIZE = 3L;
    static final String EXTRA_STORAGE_PATH = "/api/extra-storage";
    static final QName VERSION = new QName(FS.NS, "version");
    static final String extraStorageUri = "http://example.com" + EXTRA_STORAGE_PATH;

    @Mock(extraInterfaces = BlobStore.class)
    DeletableLocalBlobStore store;

    @Mock
    InputStream input;
    @Mock
    UserService userService;
    Context context = new Context();
    User user;
    Authentication.User userAuthentication;
    User admin;
    Authentication.User adminAuthentication;
    private org.eclipse.jetty.server.Request request;

    private ResourceFactory factory;
    private Dataset ds = createTxnMem();
    private Transactions tx = new SimpleTransactions(ds);
    private Model model = ds.getDefaultModel();

    private void selectRegularUser() {
        lenient().when(request.getAuthentication()).thenReturn(userAuthentication);
        lenient().when(userService.currentUser()).thenReturn(user);
    }

    private void selectAdmin() {
        lenient().when(request.getAuthentication()).thenReturn(adminAuthentication);
        lenient().when(userService.currentUser()).thenReturn(admin);
    }

    @Before
    public void before() {
        factory = new DavFactory(model.createResource(extraStorageUri), store, userService, context);

        userAuthentication = mockAuthentication("user");
        user = createTestUser("user", false);
        new DAO(model).write(user);

        adminAuthentication = mockAuthentication("admin");
        admin = createTestUser("admin", true);
        new DAO(model).write(admin);

        setupRequestContext();
        request = getCurrentRequest();
        selectRegularUser();
        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", 3, "md5"));
    }

    @Test
    public void testExtraStorageRoot() throws NotAuthorizedException, BadRequestException {
        var root = factory.getResource(null, EXTRA_STORAGE_PATH);

        assertTrue(root instanceof MakeCollectionableResource);
        assertTrue(root instanceof ExtraStorageRootResource);
        assertFalse(root instanceof PutableResource);
    }

    @Test
    public void testCreateRootExtraStorageFolder() throws NotAuthorizedException, BadRequestException, ConflictException {
        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
        var coll = root.createCollection("ex1");

        var collName = "ex1";
        assertTrue(coll instanceof FolderResource);
        assertEquals(collName, coll.getName());
        assertNotNull(root.child(collName));
        assertNotNull(factory.getResource(null, format("/api/extra-storage/%s/", collName)));
        assertEquals(1, root.getChildren().size());
    }

    @Test
    public void testNonExistingExtraStorageResource() throws NotAuthorizedException, BadRequestException {
        assertNull(factory.getResource(null, EXTRA_STORAGE_PATH + "coll/dir/file"));
    }

    @Test
    public void testOverwriteFile() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");

        assertTrue(file instanceof ReplaceableResource);

        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", FILE_SIZE + 1, "md5"));
        ((ReplaceableResource) file).replaceContent(input, FILE_SIZE + 1);

        verifyNoInteractions(input, store);

        var file2 = coll.child("file");
        assertEquals(2, ((MultiNamespaceCustomPropertyResource) file2).getProperty(VERSION));
        assertEquals(FILE_SIZE + 1, ((GetableResource) file2).getContentLength().longValue());
    }

    @Test
    public void testGetVersion() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
        var coll = (FolderResource) root.createCollection("coll");

        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");

        assertTrue(file instanceof ReplaceableResource);

        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", FILE_SIZE + 1, "md5"));
        ((ReplaceableResource) file).replaceContent(input, FILE_SIZE + 1);

        when(request.getHeader("Version")).thenReturn("1");
        var ver1 = coll.child("file");
        assertEquals(1, ((MultiNamespaceCustomPropertyResource) ver1).getProperty(VERSION));
        assertEquals(FILE_SIZE, ((GetableResource) ver1).getContentLength().longValue());

        when(request.getHeader("Version")).thenReturn("2");
        var ver2 = coll.child("file");
        assertEquals(2, ((MultiNamespaceCustomPropertyResource) ver2).getProperty(VERSION));
        assertEquals(FILE_SIZE + 1, ((GetableResource) ver2).getContentLength().longValue());
    }

    @Test
    public void testExtraStorageAccess() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var root = factory.getResource(null, EXTRA_STORAGE_PATH);
        var rootResource = model.createResource(extraStorageUri);
        var extraStorageSubdir1 = ((DavFactory) factory).root.createCollection("store1");
        var subdirResource = model.createResource(extraStorageUri + "/store1");
        var file = ((FolderResource) extraStorageSubdir1).createNew("file", input, FILE_SIZE, "text/abc");
        var fileResource = model.createResource(extraStorageUri + "/store1/file");

        assertTrue(root instanceof ExtraStorageRootResource);
        assertTrue(extraStorageSubdir1 instanceof DirectoryResource);
        assertTrue(file instanceof FileResource);

        assertEquals(Access.Write, ((DavFactory) factory).getAccess(rootResource));
        assertEquals(Access.Write, ((DavFactory) factory).getAccess(subdirResource));
        assertEquals(Access.Manage, ((DavFactory) factory).getAccess(fileResource));

        selectAdmin();
        assertEquals(Access.Write, ((DavFactory) factory).getAccess(rootResource));
        assertEquals(Access.Write, ((DavFactory) factory).getAccess(subdirResource));
        assertEquals(Access.None, ((DavFactory) factory).getAccess(fileResource));
    }

    @Test
    public void testOverwriteExtraStorageFile() throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var extraStorageSubdir1 = ((DavFactory) factory).root.createCollection("store1");
        var file1 = ((FolderResource) extraStorageSubdir1).createNew("file1", input, FILE_SIZE, "text/abc");

        assertTrue(file1 instanceof ReplaceableResource);

        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id1", FILE_SIZE + 1, "md5"));
        ((ReplaceableResource) file1).replaceContent(input, FILE_SIZE + 1);

        var children = extraStorageSubdir1.getChildren();
        var file2 = extraStorageSubdir1.child("file1");

        assertEquals(1, children.size());
        assertEquals(FILE_SIZE + 1, ((GetableResource) file2).getContentLength().longValue());
        assertEquals(2, ((MultiNamespaceCustomPropertyResource) file2).getProperty(VERSION));

        verifyNoInteractions(input, store);

        // Set request header to overwrite blob
        when(request.getHeader("Delete-Existing-Blob")).thenReturn("true");
        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id2", FILE_SIZE + 1, "md5"));
        var file3 = ((FolderResource) extraStorageSubdir1).createNew("file3", input, FILE_SIZE, "text/abc");
        ((ReplaceableResource) file2).replaceContent(input, FILE_SIZE + 1);

        assertEquals(1, children.size());
        assertEquals(1, ((MultiNamespaceCustomPropertyResource) file3).getProperty(VERSION));
        verify(store).delete("id1");
    }
}
