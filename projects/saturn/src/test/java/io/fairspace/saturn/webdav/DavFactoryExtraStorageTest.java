package io.fairspace.saturn.webdav;

import io.milton.resource.*;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.TestUtils.*;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

// todo: fix the tests
@RunWith(MockitoJUnitRunner.class)
public class DavFactoryExtraStorageTest {
    //    static final long FILE_SIZE = 3L;
    //    static final String EXTRA_STORAGE_PATH = "/api/extra-storage";
    //    static final QName VERSION = new QName(FS.NS, "version");
    //    static final String extraStorageUri = "http://example.com" + EXTRA_STORAGE_PATH;
    //
    //    @Mock(extraInterfaces = BlobStore.class)
    //    DeletableLocalBlobStore store;
    //
    //    @Mock
    //    InputStream input;
    //
    //    @Mock
    //    UserService userService;
    //
    //    Context context = new Context();
    //    User user;
    //    Authentication.User userAuthentication;
    //    User admin;
    //    Authentication.User adminAuthentication;
    //    private org.eclipse.jetty.server.Request request;
    //
    //    private ResourceFactory factory;
    //    private Dataset ds = createTxnMem();
    //    private Transactions tx = new SimpleTransactions(ds);
    //    private Model model = ds.getDefaultModel();
    //
    //    private final String defaultExtraStorageRootName = "analysis-export";
    //
    //    private void selectRegularUser() {
    //        lenient().when(request.getAuthentication()).thenReturn(userAuthentication);
    //        lenient().when(userService.currentUser()).thenReturn(user);
    //    }
    //
    //    private void selectAdmin() {
    //        lenient().when(request.getAuthentication()).thenReturn(adminAuthentication);
    //        lenient().when(userService.currentUser()).thenReturn(admin);
    //    }
    //
    //    @Before
    //    public void before() {
    //        factory = new DavFactory(model.createResource(extraStorageUri), store, userService, context);
    //
    //        userAuthentication = mockAuthentication("user");
    //        user = createTestUser("user", false);
    //        new DAO(model).write(user);
    //
    //        adminAuthentication = mockAuthentication("admin");
    //        admin = createTestUser("admin", true);
    //        new DAO(model).write(admin);
    //
    //        setupRequestContext();
    //        request = getCurrentRequest();
    //        selectRegularUser();
    //        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", 3, "md5"));
    //    }
    //
    //    @Test
    //    public void testExtraStorageRoot() throws NotAuthorizedException, BadRequestException {
    //        var root = factory.getResource(null, EXTRA_STORAGE_PATH);
    //
    //        assertTrue(root instanceof MakeCollectionableResource);
    //        assertTrue(root instanceof ExtraStorageRootResource);
    //        assertFalse(root instanceof PutableResource);
    //    }
    //
    //    @Test
    //    public void testCreateRootExtraStorageFolder()
    //            throws NotAuthorizedException, BadRequestException, ConflictException {
    //        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
    //        var coll = root.createCollection(defaultExtraStorageRootName);
    //
    //        var collName = defaultExtraStorageRootName;
    //        assertTrue(coll instanceof FolderResource);
    //        assertEquals(collName, coll.getName());
    //        assertNotNull(root.child(collName));
    //        assertNotNull(factory.getResource(null, format("/api/extra-storage/%s/", collName)));
    //        assertEquals(1, root.getChildren().size());
    //    }
    //
    //    @Test
    //    public void testNonExistingExtraStorageResource() throws NotAuthorizedException, BadRequestException {
    //        assertNull(factory.getResource(null, EXTRA_STORAGE_PATH + "coll/dir/file"));
    //    }
    //
    //    @Test
    //    public void testOverwriteFile() throws NotAuthorizedException, BadRequestException, ConflictException,
    // IOException {
    //        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
    //        var coll = (FolderResource) root.createCollection(defaultExtraStorageRootName);
    //
    //        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");
    //
    //        assertTrue(file instanceof ReplaceableResource);
    //
    //        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", FILE_SIZE + 1, "md5"));
    //        ((ReplaceableResource) file).replaceContent(input, FILE_SIZE + 1);
    //
    //        verifyNoInteractions(input, store);
    //
    //        var file2 = coll.child("file");
    //        assertEquals(2, ((MultiNamespaceCustomPropertyResource) file2).getProperty(VERSION));
    //        assertEquals(FILE_SIZE + 1, ((GetableResource) file2).getContentLength().longValue());
    //    }
    //
    //    @Test
    //    public void testGetVersion() throws NotAuthorizedException, BadRequestException, ConflictException,
    // IOException {
    //        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
    //        var coll = (FolderResource) root.createCollection(defaultExtraStorageRootName);
    //
    //        var file = coll.createNew("file", input, FILE_SIZE, "text/abc");
    //
    //        assertTrue(file instanceof ReplaceableResource);
    //
    //        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", FILE_SIZE + 1, "md5"));
    //        ((ReplaceableResource) file).replaceContent(input, FILE_SIZE + 1);
    //
    //        when(request.getHeader("Version")).thenReturn("1");
    //        var ver1 = coll.child("file");
    //        assertEquals(1, ((MultiNamespaceCustomPropertyResource) ver1).getProperty(VERSION));
    //        assertEquals(FILE_SIZE, ((GetableResource) ver1).getContentLength().longValue());
    //
    //        when(request.getHeader("Version")).thenReturn("2");
    //        var ver2 = coll.child("file");
    //        assertEquals(2, ((MultiNamespaceCustomPropertyResource) ver2).getProperty(VERSION));
    //        assertEquals(FILE_SIZE + 1, ((GetableResource) ver2).getContentLength().longValue());
    //    }
    //
    //    @Test
    //    public void testExtraStorageAccess()
    //            throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
    //        var root = factory.getResource(null, EXTRA_STORAGE_PATH);
    //        var rootResource = model.createResource(extraStorageUri);
    //        var extraStorageSubdir1 = ((DavFactory) factory).root.createCollection(defaultExtraStorageRootName);
    //        var subdirResource = model.createResource(extraStorageUri + "/" + defaultExtraStorageRootName);
    //        var file = ((FolderResource) extraStorageSubdir1).createNew("file", input, FILE_SIZE, "text/abc");
    //        var fileResource = model.createResource(extraStorageUri + "/" + defaultExtraStorageRootName + "/file");
    //
    //        assertTrue(root instanceof ExtraStorageRootResource);
    //        assertTrue(extraStorageSubdir1 instanceof DirectoryResource);
    //        assertTrue(file instanceof FileResource);
    //
    //        assertEquals(Access.Read, ((DavFactory) factory).getAccess(rootResource));
    //        assertEquals(Access.Write, ((DavFactory) factory).getAccess(subdirResource));
    //        assertEquals(Access.Write, ((DavFactory) factory).getAccess(fileResource));
    //
    //        selectAdmin();
    //        assertEquals(Access.Read, ((DavFactory) factory).getAccess(rootResource));
    //        assertEquals(Access.Write, ((DavFactory) factory).getAccess(subdirResource));
    //        assertEquals(Access.None, ((DavFactory) factory).getAccess(fileResource));
    //    }
    //
    //    @Test
    //    public void testDeleteExtraStoreFile()
    //            throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
    //        var extraStorageSubdir1 = ((DavFactory) factory).root.createCollection(defaultExtraStorageRootName);
    //        var file = ((FolderResource) extraStorageSubdir1).createNew("file", input, FILE_SIZE, "text/abc");
    //
    //        assertTrue(file instanceof DeletableResource);
    //        ((DeletableResource) file).delete();
    //
    //        verify(store, times(1)).delete("id"); // check if blob is deleted
    //
    //        assertEquals(0, extraStorageSubdir1.getChildren().size());
    //        assertNull(extraStorageSubdir1.child("file"));
    //    }
    //
    //    @Test
    //    public void testDeleteAllInFolder()
    //            throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
    //        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
    //        var coll = (FolderResource) root.createCollection(defaultExtraStorageRootName);
    //        var file1 = coll.createNew("file1", input, FILE_SIZE, "text/abc");
    //        var file2 = coll.createNew("file2", input, FILE_SIZE, "text/abc");
    //        var file3 = coll.createNew("file3", input, FILE_SIZE, "text/abc");
    //
    //        ((PostableResource) root.child(defaultExtraStorageRootName))
    //                .processForm(Map.of("action", "delete_all_in_directory"), Map.of());
    //
    //        verify(store, times(3)).delete(any()); // check if all blob are deleted
    //
    //        assertEquals(0, coll.getChildren().size());
    //        assertNull(coll.child("file1"));
    //        assertNull(coll.child("file2"));
    //        assertNull(coll.child("file3"));
    //    }
    //
    //    @Test(expected = NotAuthorizedException.class)
    //    public void testThrowsErrorWhenNonDefaultRootDirectoryName()
    //            throws NotAuthorizedException, BadRequestException, ConflictException {
    //        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
    //        var coll = (FolderResource) root.createCollection("coll1");
    //    }
    //
    //    @Test()
    //    public void testThrowsErrorWhenDeletingRootDirectory()
    //            throws NotAuthorizedException, BadRequestException, ConflictException {
    //        var root = (MakeCollectionableResource) factory.getResource(null, EXTRA_STORAGE_PATH);
    //        var coll = (FolderResource) root.createCollection(defaultExtraStorageRootName);
    //        assertThrows(NotAuthorizedException.class, coll::delete);
    //    }
}
