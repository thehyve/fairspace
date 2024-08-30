package io.fairspace.saturn.services.search;

import java.io.IOException;
import java.sql.SQLException;

import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.MakeCollectionableResource;
import io.milton.resource.PutableResource;
import org.apache.jena.query.Dataset;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.sparql.core.DatasetGraphFactory;
import org.apache.jena.sparql.util.Context;
import org.eclipse.jetty.server.Authentication;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.PostgresAwareTest;
import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.config.ConfigLoader;
import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.rdf.transactions.TxnIndexDatasetGraph;
import io.fairspace.saturn.services.maintenance.MaintenanceService;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.services.metadata.validation.UniqueLabelValidator;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.views.*;
import io.fairspace.saturn.services.workspaces.Workspace;
import io.fairspace.saturn.services.workspaces.WorkspaceRole;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.webdav.DavFactory;
import io.fairspace.saturn.webdav.blobstore.BlobInfo;
import io.fairspace.saturn.webdav.blobstore.BlobStore;

import static io.fairspace.saturn.TestUtils.*;
import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;

import static org.apache.jena.query.DatasetFactory.wrap;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class JdbcFileSearchServiceTest extends PostgresAwareTest {
    static final String BASE_PATH = "/api/webdav";
    static final String baseUri = ConfigLoader.CONFIG.publicUrl + BASE_PATH;

    @Mock
    BlobStore store;

    @Mock
    UserService userService;

    @Mock
    private MetadataPermissions permissions;

    WorkspaceService workspaceService;
    MetadataService api;
    FileSearchService fileSearchService;
    MaintenanceService maintenanceService;

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
    public void before()
            throws SQLException, NotAuthorizedException, BadRequestException, ConflictException, IOException {
        var viewDatabase = new Config.ViewDatabase();
        viewDatabase.url = postgres.getJdbcUrl();
        viewDatabase.username = postgres.getUsername();
        viewDatabase.password = postgres.getPassword();
        viewDatabase.maxPoolSize = 5;
        ViewsConfig config = loadViewsConfig("src/test/resources/test-views.yaml");
        var viewStoreClientFactory = new ViewStoreClientFactory(config, viewDatabase, new Config.Search());

        var dsg = new TxnIndexDatasetGraph(DatasetGraphFactory.createTxnMem(), viewStoreClientFactory);
        Dataset ds = wrap(dsg);
        Transactions tx = new SimpleTransactions(ds);
        Model model = ds.getDefaultModel();
        var vocabulary = model.read("test-vocabulary.ttl");

        var viewService = new ViewService(ConfigLoader.CONFIG, config, ds, viewStoreClientFactory, permissions);

        maintenanceService = new MaintenanceService(userService, ds, viewStoreClientFactory, viewService);

        workspaceService = new WorkspaceService(tx, userService);

        var context = new Context();

        var davFactory = new DavFactory(model.createResource(baseUri), store, userService, context);

        fileSearchService = new JdbcFileSearchService(
                ConfigLoader.CONFIG.search,
                loadViewsConfig("src/test/resources/test-views.yaml"),
                viewStoreClientFactory,
                tx,
                davFactory.root);

        when(permissions.canWriteMetadata(any())).thenReturn(true);

        api = new MetadataService(tx, vocabulary, new ComposedValidator(new UniqueLabelValidator()), permissions);

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

        var taxonomies = model.read("test-taxonomies.ttl");
        api.put(taxonomies, Boolean.TRUE);

        var workspace = workspaceService.createWorkspace(
                Workspace.builder().code("Test").build());
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

        var coll3 = (PutableResource) root.createCollection("coll3");

        coll3.createNew("sample-s2-b-rna_copy.fastq", null, 0L, "chemical/seq-na-fastq");

        var testdata = model.read("testdata.ttl");
        api.put(testdata, Boolean.TRUE);
    }

    @Test
    public void testSearchFiles() {
        var request = new FileSearchRequest();
        // There are two files with 'rna' in the file name in coll2.
        request.setQuery("rna");
        var results = fileSearchService.searchFiles(request);
        Assert.assertEquals(2, results.size());
        // Expect the results to be sorted by id
        Assert.assertEquals("sample-s2-b-rna.fastq", results.get(0).getLabel());
        Assert.assertEquals("sample-s2-b-rna_copy.fastq", results.get(1).getLabel());
    }

    @Test
    public void testSearchFilesRestrictsToAccessibleCollections() {
        var request = new FileSearchRequest();
        // There is one file named coffee.jpg in coll1, not accessible by the regular user.
        request.setQuery("coffee");
        var results = fileSearchService.searchFiles(request);
        Assert.assertEquals(0, results.size());

        selectAdmin();
        results = fileSearchService.searchFiles(request);
        Assert.assertEquals(1, results.size());
        Assert.assertEquals("coffee.jpg", results.get(0).getLabel());
    }

    @Test
    public void testSearchFilesRestrictsToAccessibleCollectionsAfterReindexing() {
        maintenanceService.recreateIndex();
        var request = new FileSearchRequest();
        // There is one file named coffee.jpg in coll1, not accessible by the regular user.
        request.setQuery("coffee");
        var results = fileSearchService.searchFiles(request);
        Assert.assertEquals(0, results.size());

        selectAdmin();
        results = fileSearchService.searchFiles(request);
        Assert.assertEquals(1, results.size());
        Assert.assertEquals("coffee.jpg", results.get(0).getLabel());
    }

    @Test
    public void testSearchFilesRestrictsToParentDirectory() {
        selectAdmin();
        var request = new FileSearchRequest();
        // There is one file named coffee.jpg in coll1.
        request.setQuery("coffee");

        request.setParentIRI(ConfigLoader.CONFIG.publicUrl + "/api/webdav/coll1");
        var results = fileSearchService.searchFiles(request);
        Assert.assertEquals(1, results.size());

        request.setParentIRI(ConfigLoader.CONFIG.publicUrl + "/api/webdav/coll2");
        results = fileSearchService.searchFiles(request);
        Assert.assertEquals(0, results.size());
    }

    @Test
    public void testSearchFileDescription() {
        selectAdmin();
        var request = new FileSearchRequest();
        // There is one file named sample-s2-b-rna.fastq with a description
        request.setQuery("corona");

        // request.setParentIRI(ConfigLoader.CONFIG.publicUrl + "/api/webdav/coll1");
        var results = fileSearchService.searchFiles(request);
        Assert.assertEquals(1, results.size());
    }
}
