package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.rdf.dao.*;
import io.fairspace.saturn.rdf.transactions.*;
import io.fairspace.saturn.services.metadata.*;
import io.fairspace.saturn.services.metadata.validation.*;
import io.fairspace.saturn.services.users.*;
import io.fairspace.saturn.services.workspaces.*;
import io.fairspace.saturn.webdav.*;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.*;
import io.milton.resource.*;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.*;
import org.apache.jena.sparql.core.*;
import org.apache.jena.sparql.util.*;
import org.eclipse.jetty.server.*;
import org.junit.*;
import org.junit.runner.*;
import org.mockito.*;
import org.mockito.junit.*;

import java.io.*;
import java.sql.*;
import java.util.*;

import static io.fairspace.saturn.TestUtils.*;
import static io.fairspace.saturn.auth.RequestContext.*;
import static io.fairspace.saturn.config.Services.FS_ROOT;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;
import static org.apache.jena.query.DatasetFactory.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class JdbcQueryServiceTest {
    static final String BASE_PATH = "/api/v1/webdav";
    static final String baseUri = "http://example.com" + BASE_PATH;
    static final String SAMPLE_NATURE_BLOOD = "http://ncicb.nci.nih.gov/xml/owl/EVS/Thesaurus.owl#C12434";
    static final String ANALYSIS_TYPE_RNA_SEQ = "https://institut-curie.org/analysis#O6-12";
    static final String ANALYSIS_TYPE_IMAGING = "https://institut-curie.org/analysis#C37-2";

    @Mock
    BlobStore store;
    @Mock
    UserService userService;
    @Mock
    private MetadataPermissions permissions;
    WorkspaceService workspaceService;
    MetadataService api;
    QueryService queryService;

    User user;
    Authentication.User userAuthentication;
    User workspaceManager;
    Authentication.User workspaceManagerAuthentication;
    User admin;
    Authentication.User adminAuthentication;
    private org.eclipse.jetty.server.Request request;

    private void selectRegularUser() {
        lenient().when(request.getAuthentication()).thenReturn(userAuthentication);
        lenient().when(userService.currentUser()).thenReturn(user);
    }

    private void selectAdmin() {
        lenient().when(request.getAuthentication()).thenReturn(adminAuthentication);
        lenient().when(userService.currentUser()).thenReturn(admin);
    }

    @Before
    public void before() throws SQLException, NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var viewDatabase = new Config.ViewDatabase();
        viewDatabase.url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE";
        viewDatabase.username = "sa";
        viewDatabase.password = "";
        ViewsConfig config = ConfigLoader.VIEWS_CONFIG;
        ViewStoreClientFactory.H2_DATABASE = true;
        var viewStoreClient = ViewStoreClientFactory.build(config, viewDatabase);

        var dsg = new TxnIndexDatasetGraph(DatasetGraphFactory.createTxnMem(), viewStoreClient);
        Dataset ds = wrap(dsg);
        Transactions tx = new SimpleTransactions(ds);
        Model model = ds.getDefaultModel();

        workspaceService = new WorkspaceService(tx, userService);

        var context = new Context();

        var davFactory = new DavFactory(model.createResource(baseUri), store, userService, context);
        ds.getContext().set(FS_ROOT, davFactory.root);

        queryService = new JdbcQueryService(ConfigLoader.CONFIG.search, viewStoreClient, tx, davFactory.root);

        when(permissions.canWriteMetadata(any())).thenReturn(true);
        api = new MetadataService(tx, VOCABULARY, new ComposedValidator(new UniqueLabelValidator()), permissions);

        userAuthentication = mockAuthentication("user");
        user = createTestUser("user", false);
        new DAO(model).write(user);
        workspaceManager = createTestUser("workspace-admin", false);
        new DAO(model).write(workspaceManager);
        workspaceManagerAuthentication = mockAuthentication("workspace-admin");
        adminAuthentication = mockAuthentication("admin");
        admin = createTestUser("admin", true);
        new DAO(model).write(admin);

        setupRequestContext();
        request = getCurrentRequest();

        selectAdmin();

        var taxonomies = model.read("taxonomies.ttl");
        api.put(taxonomies);

        var workspace = workspaceService.createWorkspace(Workspace.builder().name("Test").build());
        workspaceService.setUserRole(workspace.getIri(), workspaceManager.getIri(), WorkspaceRole.Manager);
        workspaceService.setUserRole(workspace.getIri(), user.getIri(), WorkspaceRole.Member);

        when(request.getHeader("Owner")).thenReturn(workspace.getIri().getURI());
        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", 0, "md5"));

        var root = (MakeCollectionableResource) ((ResourceFactory) davFactory).getResource(null, BASE_PATH);
        var coll1 = (PutableResource) root.createCollection("coll1");
        coll1.createNew("coffee.jpg", null, 0L, "image/jpeg");

        selectRegularUser();

        var coll2 = (PutableResource) root.createCollection("coll2");
        coll2.createNew("sample-s2-b-rna.fastq", null, 0L, "chemical/seq-na-fastq");

        var testdata = model.read("testdata.ttl");
        api.put(testdata);
    }

    @Test
    public void testRetrieveSamplePage() {
        var request = new ViewRequest();
        request.setView("Sample");
        request.setPage(1);
        request.setSize(10);
        var page = queryService.retrieveViewPage(request);
        Assert.assertEquals(2, page.getRows().size());
        var row = page.getRows().get(0);
        Assert.assertEquals("Sample A for subject 1", row.get("Sample").stream().findFirst().orElseThrow().getLabel());
        Assert.assertEquals("Blood", row.get("Sample_nature").stream().findFirst().orElseThrow().getLabel());
        Assert.assertEquals("Liver", row.get("Sample_topography").stream().findFirst().orElseThrow().getLabel());
        Assert.assertEquals(45.2f, ((Number)row.get("Sample_tumorCellularity").stream().findFirst().orElseThrow().getValue()).floatValue(), 0.01);
    }

    @Test
    public void testRetrieveSamplePageUsingSampleFilter() {
        var request = new ViewRequest();
        request.setView("Sample");
        request.setPage(1);
        request.setSize(10);
        request.setFilters(Collections.singletonList(
                ViewFilter.builder()
                        .field("Sample_nature")
                        .values(Collections.singletonList(SAMPLE_NATURE_BLOOD))
                        .build()
        ));
        var page = queryService.retrieveViewPage(request);
        Assert.assertEquals(1, page.getRows().size());
    }

    @Test @Ignore
    public void testRetrieveSamplePageForAccessibleCollection() {
        var request = new ViewRequest();
        request.setView("Sample");
        request.setPage(1);
        request.setSize(10);
        request.setFilters(Collections.singletonList(
                ViewFilter.builder()
                        .field("Resource_analysisType")
                        .values(Collections.singletonList(ANALYSIS_TYPE_RNA_SEQ))
                        .build()
        ));
        var page = queryService.retrieveViewPage(request);
        Assert.assertEquals(1, page.getRows().size());
    }

    @Test
    public void testRetrieveSamplePageForUnaccessibleCollection() {
        var request = new ViewRequest();
        request.setView("Sample");
        request.setPage(1);
        request.setSize(10);
        request.setFilters(Collections.singletonList(
                ViewFilter.builder()
                        .field("Resource_analysisType")
                        .values(Collections.singletonList(ANALYSIS_TYPE_IMAGING))
                        .build()
        ));
        var page = queryService.retrieveViewPage(request);
        Assert.assertEquals(0, page.getRows().size());
    }

    @Test
    public void testRetrieveSamplePageIncludeJoin() {
        var request = new ViewRequest();
        request.setView("Sample");
        request.setPage(1);
        request.setSize(10);
        request.setIncludeJoinedViews(true);
        var page = queryService.retrieveViewPage(request);
        Assert.assertEquals(2, page.getRows().size());
        var row1 = page.getRows().get(0);
        Assert.assertEquals("Sample A for subject 1", row1.get("Sample").stream().findFirst().orElseThrow().getLabel());
        Assert.assertEquals(1, row1.get("Subject").size());
        var row2 = page.getRows().get(1);
        Assert.assertEquals("Sample B for subject 2", row2.get("Sample").stream().findFirst().orElseThrow().getLabel());
        Assert.assertEquals(1, row2.get("Resource_analysisType").size());
    }

    @Test
    public void testCountSamples() {
        var request = new CountRequest();
        request.setView("Sample");
        var result = queryService.count(request);
        Assert.assertEquals(2, result.getCount());
    }
}
