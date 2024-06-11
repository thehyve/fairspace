package io.fairspace.saturn.services.views;

import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.PostgresAwareTest;

// todo: fix the tests
@RunWith(MockitoJUnitRunner.class)
public class ViewServiceTest extends PostgresAwareTest {
    //    static final String BASE_PATH = "/api/webdav";
    //    static final String baseUri = ConfigLoader.CONFIG.publicUrl + BASE_PATH;
    //
    //    @Mock
    //    BlobStore store;
    //
    //    @Mock
    //    UserService userService;
    //
    //    @Mock
    //    private MetadataPermissions permissions;
    //
    //    MetadataService api;
    //    ViewService viewService;
    //
    //    @Before
    //    public void before()
    //            throws SQLException, BadRequestException, ConflictException, NotAuthorizedException, IOException {
    //        var viewDatabase = buildViewDatabaseConfig();
    //        ViewsConfig config = loadViewsConfig("src/test/resources/test-views.yaml");
    //        var viewStoreClientFactory = new ViewStoreClientFactory(config, viewDatabase, new Config.Search());
    //
    //        var dsg = new TxnIndexDatasetGraph(DatasetGraphFactory.createTxnMem(), viewStoreClientFactory);
    //
    //        Dataset ds = wrap(dsg);
    //
    //        loadTestData(ds);
    //
    //        viewService = new ViewService(ConfigLoader.CONFIG, config, ds, viewStoreClientFactory, permissions);
    //    }
    //
    //    @Test
    //    public void testFetchViewConfig() {
    //        when(permissions.canReadFacets()).thenReturn(true);
    //        var facets = viewService.getFacets();
    //        var dateFacets = facets.stream()
    //                .filter(facet -> facet.getType() == ViewsConfig.ColumnType.Date)
    //                .toList();
    //        Assert.assertEquals(2, dateFacets.size());
    //
    //        var boolFacets = facets.stream()
    //                .filter(facet -> facet.getType() == ViewsConfig.ColumnType.Boolean)
    //                .toList();
    //        Assert.assertEquals(1, boolFacets.size());
    //    }
    //
    //    @Test
    //    public void testNoAccessExceptionFetchingFacetsWhenUserHasNoPermissions() {
    //        when(permissions.canReadFacets()).thenReturn(false);
    //
    //        Assert.assertThrows(
    //                USER_DOES_NOT_HAVE_PERMISSIONS_TO_READ_FACETS,
    //                AccessDeniedException.class,
    //                () -> viewService.getFacets());
    //    }
    //
    //    @Test
    //    public void testDisplayIndex_IsSet() {
    //        var views = viewService.getViews();
    //        var columns = views.get(1).getColumns().stream().toList();
    //        var selectedColumn = columns.stream()
    //                .filter(c -> c.getTitle().equals("Morphology"))
    //                .collect(Collectors.toList())
    //                .get(0);
    //        Assert.assertEquals(Integer.valueOf(1), selectedColumn.getDisplayIndex());
    //    }
    //
    //    @Test
    //    public void testDisplayIndex_IsNotSet() {
    //        var views = viewService.getViews();
    //        var columns = views.get(1).getColumns().stream().toList();
    //        var selectedColumn = columns.stream()
    //                .filter(c -> c.getTitle().equals("Laterality"))
    //                .collect(Collectors.toList())
    //                .get(0);
    //        Assert.assertEquals(Integer.valueOf(Integer.MAX_VALUE), selectedColumn.getDisplayIndex());
    //    }
    //
    //    @Test
    //    public void testFetchCachedFacets() {
    //        // given
    //        var sut = spy(viewService);
    //        when(permissions.canReadFacets()).thenReturn(true);
    //
    //        // when
    //        var facets = sut.getFacets();
    //
    //        // then
    //        Assert.assertEquals(facets.size(), 11);
    //        verify(sut, never()).fetchFacets();
    //    }
    //
    //    @Test
    //    public void testFetchCachedViews() {
    //        // given
    //        var sut = spy(viewService);
    //
    //        // when
    //        var views = viewService.getViews();
    //
    //        // then
    //        Assert.assertEquals(views.size(), 4);
    //        verify(sut, never()).fetchViews();
    //    }
    //
    //    private Config.ViewDatabase buildViewDatabaseConfig() {
    //        var viewDatabase = new Config.ViewDatabase();
    //        viewDatabase.url = postgres.getJdbcUrl();
    //        viewDatabase.username = postgres.getUsername();
    //        viewDatabase.password = postgres.getPassword();
    //        viewDatabase.maxPoolSize = 5;
    //        return viewDatabase;
    //    }
    //
    //    private void loadTestData(Dataset ds)
    //            throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
    //        // TODO: loaded data to be mocked instead of loading them this way
    //        Transactions tx = new SimpleTransactions(ds);
    //        Model model = ds.getDefaultModel();
    //        var vocabulary = model.read("test-vocabulary.ttl");
    //
    //        var workspaceService = new WorkspaceService(tx, userService);
    //
    //        var context = new Context();
    //
    //        var davFactory = new DavFactory(model.createResource(baseUri), store, userService, context);
    //
    //        when(permissions.canWriteMetadata(any())).thenReturn(true);
    //        api = new MetadataService(tx, vocabulary, new ComposedValidator(new UniqueLabelValidator()), permissions);
    //
    //        setupRequestContext();
    //        var request = getCurrentRequest();
    //
    //        var taxonomies = model.read("test-taxonomies.ttl");
    //        api.put(taxonomies, Boolean.TRUE);
    //
    //        User user = createTestUser("user", true);
    //        Authentication.User userAuthentication = mockAuthentication("admin");
    //        lenient().when(request.getAuthentication()).thenReturn(userAuthentication);
    //        lenient().when(userService.currentUser()).thenReturn(user);
    //
    //        var workspace = workspaceService.createWorkspace(
    //                Workspace.builder().code("Test").build());
    //
    //        when(request.getHeader("Owner")).thenReturn(workspace.getIri().getURI());
    //        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", 0, "md5"));
    //
    //        var root = (MakeCollectionableResource) ((ResourceFactory) davFactory).getResource(null, BASE_PATH);
    //        var coll1 = (PutableResource) root.createCollection("coll1");
    //        coll1.createNew("coffee.jpg", null, 0L, "image/jpeg");
    //
    //        var testdata = model.read("testdata.ttl");
    //        api.put(testdata, Boolean.TRUE);
    //    }
}
