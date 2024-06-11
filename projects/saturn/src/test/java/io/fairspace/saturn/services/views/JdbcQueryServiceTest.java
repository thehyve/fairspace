package io.fairspace.saturn.services.views;

import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.PostgresAwareTest;

// todo: fix the tests
@RunWith(MockitoJUnitRunner.class)
public class JdbcQueryServiceTest extends PostgresAwareTest {
    //    static final String BASE_PATH = "/api/webdav";
    //    static final String baseUri = ConfigLoader.CONFIG.publicUrl + BASE_PATH;
    //    static final String SAMPLE_NATURE_BLOOD = "http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#C12434";
    //    static final String ANALYSIS_TYPE_RNA_SEQ = "https://institut-curie.org/osiris#O6-12";
    //    static final String ANALYSIS_TYPE_IMAGING = "https://institut-curie.org/osiris#C37-2";
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
    //    WorkspaceService workspaceService;
    //    MetadataService api;
    //    QueryService sut;
    //    MaintenanceService maintenanceService;
    //
    //    User user;
    //    Authentication.User userAuthentication;
    //    User workspaceManager;
    //    Authentication.User workspaceManagerAuthentication;
    //    User admin;
    //    Authentication.User adminAuthentication;
    //    private org.eclipse.jetty.server.Request request;
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
    //    public void before()
    //            throws SQLException, NotAuthorizedException, BadRequestException, ConflictException, IOException {
    //        var viewDatabase = new Config.ViewDatabase();
    //        viewDatabase.url = postgres.getJdbcUrl();
    //        viewDatabase.username = postgres.getUsername();
    //        viewDatabase.password = postgres.getPassword();
    //        viewDatabase.maxPoolSize = 5;
    //        ViewsConfig config = loadViewsConfig("src/test/resources/test-views.yaml");
    //        var viewStoreClientFactory = new ViewStoreClientFactory(config, viewDatabase, new Config.Search());
    //
    //        var dsg = new TxnIndexDatasetGraph(DatasetGraphFactory.createTxnMem(), viewStoreClientFactory);
    //        Dataset ds = wrap(dsg);
    //        Transactions tx = new SimpleTransactions(ds);
    //        Model model = ds.getDefaultModel();
    //        var vocabulary = model.read("test-vocabulary.ttl");
    //
    //        var viewService = new ViewService(ConfigLoader.CONFIG, config, ds, viewStoreClientFactory, permissions);
    //
    //        maintenanceService = new MaintenanceService(userService, ds, viewStoreClientFactory, viewService);
    //
    //        workspaceService = new WorkspaceService(tx, userService);
    //
    //        var context = new Context();
    //
    //        var davFactory = new DavFactory(model.createResource(baseUri), store, userService, context);
    //
    //        sut = new JdbcQueryService(ConfigLoader.CONFIG.search, viewStoreClientFactory, tx, davFactory.root);
    //
    //        when(permissions.canWriteMetadata(any())).thenReturn(true);
    //
    //        api = new MetadataService(tx, vocabulary, new ComposedValidator(new UniqueLabelValidator()), permissions);
    //
    //        userAuthentication = mockAuthentication("user");
    //        user = createTestUser("user", false);
    //        new DAO(model).write(user);
    //        workspaceManager = createTestUser("workspace-admin", false);
    //        new DAO(model).write(workspaceManager);
    //        workspaceManagerAuthentication = mockAuthentication("workspace-admin");
    //        adminAuthentication = mockAuthentication("admin");
    //        admin = createTestUser("admin", true);
    //        new DAO(model).write(admin);
    //
    //        setupRequestContext();
    //        request = getCurrentRequest();
    //
    //        selectAdmin();
    //
    //        var taxonomies = model.read("test-taxonomies.ttl");
    //        api.put(taxonomies, Boolean.TRUE);
    //
    //        var workspace = workspaceService.createWorkspace(
    //                Workspace.builder().code("Test").build());
    //        workspaceService.setUserRole(workspace.getIri(), workspaceManager.getIri(), WorkspaceRole.Manager);
    //        workspaceService.setUserRole(workspace.getIri(), user.getIri(), WorkspaceRole.Member);
    //
    //        when(request.getHeader("Owner")).thenReturn(workspace.getIri().getURI());
    //        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", 0, "md5"));
    //
    //        var root = (MakeCollectionableResource) ((ResourceFactory) davFactory).getResource(null, BASE_PATH);
    //        var coll1 = (PutableResource) root.createCollection("coll1");
    //        coll1.createNew("coffee.jpg", null, 0L, "image/jpeg");
    //
    //        selectRegularUser();
    //
    //        var coll2 = (PutableResource) root.createCollection("coll2");
    //        coll2.createNew("sample-s2-b-rna.fastq", null, 0L, "chemical/seq-na-fastq");
    //
    //        var coll3 = (PutableResource) root.createCollection("coll3");
    //
    //        coll3.createNew("sample-s2-b-rna_copy.fastq", null, 0L, "chemical/seq-na-fastq");
    //
    //        var testdata = model.read("testdata.ttl");
    //        api.put(testdata, Boolean.TRUE);
    //    }
    //
    //    @Test
    //    public void testRetrieveSamplePage() {
    //        var request = new ViewRequest();
    //        request.setView("Sample");
    //        request.setPage(1);
    //        request.setSize(10);
    //        var page = sut.retrieveViewPage(request);
    //        Assert.assertEquals(2, page.getRows().size());
    //        var row = page.getRows().get(0);
    //        Assert.assertEquals(
    //                Set.of(
    //                        "Sample",
    //                        "Sample_nature",
    //                        "Sample_parentIsOfNature",
    //                        "Sample_origin",
    //                        "Sample_topography",
    //                        "Sample_tumorCellularity"),
    //                row.keySet());
    //        Assert.assertEquals(
    //                "Sample A for subject 1",
    //                row.get("Sample").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                "Blood",
    //                row.get("Sample_nature").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                "Liver",
    //                row.get("Sample_topography").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                45.2f,
    //                ((Number) row.get("Sample_tumorCellularity").stream()
    //                                .findFirst()
    //                                .orElseThrow()
    //                                .getValue())
    //                        .floatValue(),
    //                0.01);
    //    }
    //
    //    @Test
    //    public void testRetrieveSamplePageAfterReindexing() {
    //        maintenanceService.recreateIndex();
    //        var request = new ViewRequest();
    //        request.setView("Sample");
    //        request.setPage(1);
    //        request.setSize(10);
    //        var page = sut.retrieveViewPage(request);
    //        Assert.assertEquals(2, page.getRows().size());
    //        var row = page.getRows().get(0);
    //        Assert.assertEquals(
    //                Set.of(
    //                        "Sample",
    //                        "Sample_nature",
    //                        "Sample_parentIsOfNature",
    //                        "Sample_origin",
    //                        "Sample_topography",
    //                        "Sample_tumorCellularity"),
    //                row.keySet());
    //        Assert.assertEquals(
    //                "Sample A for subject 1",
    //                row.get("Sample").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                "Blood",
    //                row.get("Sample_nature").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                "Liver",
    //                row.get("Sample_topography").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                45.2f,
    //                ((Number) row.get("Sample_tumorCellularity").stream()
    //                                .findFirst()
    //                                .orElseThrow()
    //                                .getValue())
    //                        .floatValue(),
    //                0.01);
    //    }
    //
    //    @Test
    //    public void testRetrieveSamplePageUsingSampleFilter() {
    //        var request = new ViewRequest();
    //        request.setView("Sample");
    //        request.setPage(1);
    //        request.setSize(10);
    //        request.setFilters(Collections.singletonList(ViewFilter.builder()
    //                .field("Sample_nature")
    //                .values(Collections.singletonList(SAMPLE_NATURE_BLOOD))
    //                .build()));
    //        var page = sut.retrieveViewPage(request);
    //        Assert.assertEquals(1, page.getRows().size());
    //    }
    //
    //    @Test
    //    public void testRetrieveSamplePageForAccessibleCollection() {
    //        var request = new ViewRequest();
    //        request.setView("Sample");
    //        request.setPage(1);
    //        request.setSize(10);
    //        request.setFilters(Collections.singletonList(ViewFilter.builder()
    //                .field("Resource_analysisType")
    //                .values(Collections.singletonList(ANALYSIS_TYPE_RNA_SEQ))
    //                .build()));
    //        var page = sut.retrieveViewPage(request);
    //        Assert.assertEquals(1, page.getRows().size());
    //    }
    //
    //    @Test
    //    public void testRetrieveSamplePageForUnaccessibleCollection() {
    //        var request = new ViewRequest();
    //        request.setView("Sample");
    //        request.setPage(1);
    //        request.setSize(10);
    //        request.setFilters(Collections.singletonList(ViewFilter.builder()
    //                .field("Resource_analysisType")
    //                .values(Collections.singletonList(ANALYSIS_TYPE_IMAGING))
    //                .build()));
    //        var page = sut.retrieveViewPage(request);
    //        Assert.assertEquals(0, page.getRows().size());
    //    }
    //
    //    @Test
    //    public void testRetrieveSamplePageIncludeJoin() {
    //        var request = new ViewRequest();
    //        request.setView("Sample");
    //        request.setPage(1);
    //        request.setSize(10);
    //        request.setIncludeJoinedViews(true);
    //        var page = sut.retrieveViewPage(request);
    //        Assert.assertEquals(2, page.getRows().size());
    //        var row1 = page.getRows().get(0);
    //        Assert.assertEquals(
    //                "Sample A for subject 1",
    //                row1.get("Sample").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(1, row1.get("Subject").size());
    //        var row2 = page.getRows().get(1);
    //        Assert.assertEquals(
    //                "Sample B for subject 2",
    //                row2.get("Sample").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                Set.of("RNA-seq", "Whole genome sequencing"),
    //                row2.get("Resource_analysisType").stream()
    //                        .map(ValueDTO::getLabel)
    //                        .collect(Collectors.toSet()));
    //    }
    //
    //    @Test
    //    public void testRetrieveSamplePageIncludeJoinAfterReindexing() {
    //        maintenanceService.recreateIndex();
    //        var request = new ViewRequest();
    //        request.setView("Sample");
    //        request.setPage(1);
    //        request.setSize(10);
    //        request.setIncludeJoinedViews(true);
    //        var page = sut.retrieveViewPage(request);
    //        Assert.assertEquals(2, page.getRows().size());
    //        var row1 = page.getRows().get(0);
    //        Assert.assertEquals(
    //                "Sample A for subject 1",
    //                row1.get("Sample").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(1, row1.get("Subject").size());
    //        var row2 = page.getRows().get(1);
    //        Assert.assertEquals(
    //                "Sample B for subject 2",
    //                row2.get("Sample").stream().findFirst().orElseThrow().getLabel());
    //        Assert.assertEquals(
    //                Set.of("RNA-seq", "Whole genome sequencing"),
    //                row2.get("Resource_analysisType").stream()
    //                        .map(ValueDTO::getLabel)
    //                        .collect(Collectors.toSet()));
    //    }
    //
    //    @Test
    //    public void testCountSamples() {
    //        var request = new CountRequest();
    //        request.setView("Sample");
    //        var result = sut.count(request);
    //        Assert.assertEquals(2, result.getCount());
    //    }
    //
    //    @Test
    //    public void testSearchFiles() {
    //        var request = new FileSearchRequest();
    //        // There are two files with 'rna' in the file name in coll2.
    //        request.setQuery("rna");
    //        var results = sut.searchFiles(request);
    //        Assert.assertEquals(2, results.size());
    //        // Expect the results to be sorted by id
    //        Assert.assertEquals("sample-s2-b-rna.fastq", results.get(0).getLabel());
    //        Assert.assertEquals("sample-s2-b-rna_copy.fastq", results.get(1).getLabel());
    //    }
    //
    //    @Test
    //    public void testSearchFilesRestrictsToAccessibleCollections() {
    //        var request = new FileSearchRequest();
    //        // There is one file named coffee.jpg in coll1, not accessible by the regular user.
    //        request.setQuery("coffee");
    //        var results = sut.searchFiles(request);
    //        Assert.assertEquals(0, results.size());
    //
    //        selectAdmin();
    //        results = sut.searchFiles(request);
    //        Assert.assertEquals(1, results.size());
    //        Assert.assertEquals("coffee.jpg", results.get(0).getLabel());
    //    }
    //
    //    @Test
    //    public void testSearchFilesRestrictsToAccessibleCollectionsAfterReindexing() {
    //        maintenanceService.recreateIndex();
    //        var request = new FileSearchRequest();
    //        // There is one file named coffee.jpg in coll1, not accessible by the regular user.
    //        request.setQuery("coffee");
    //        var results = sut.searchFiles(request);
    //        Assert.assertEquals(0, results.size());
    //
    //        selectAdmin();
    //        results = sut.searchFiles(request);
    //        Assert.assertEquals(1, results.size());
    //        Assert.assertEquals("coffee.jpg", results.get(0).getLabel());
    //    }
    //
    //    @Test
    //    public void testSearchFilesRestrictsToParentDirectory() {
    //        selectAdmin();
    //        var request = new FileSearchRequest();
    //        // There is one file named coffee.jpg in coll1.
    //        request.setQuery("coffee");
    //
    //        request.setParentIRI(ConfigLoader.CONFIG.publicUrl + "/api/webdav/coll1");
    //        var results = sut.searchFiles(request);
    //        Assert.assertEquals(1, results.size());
    //
    //        request.setParentIRI(ConfigLoader.CONFIG.publicUrl + "/api/webdav/coll2");
    //        results = sut.searchFiles(request);
    //        Assert.assertEquals(0, results.size());
    //    }
    //
    //    @Test
    //    public void testSearchFileDescription() {
    //        selectAdmin();
    //        var request = new FileSearchRequest();
    //        // There is one file named sample-s2-b-rna.fastq with a description
    //        request.setQuery("corona");
    //
    //        // request.setParentIRI(ConfigLoader.CONFIG.publicUrl + "/api/webdav/coll1");
    //        var results = sut.searchFiles(request);
    //        Assert.assertEquals(1, results.size());
    //    }
}
