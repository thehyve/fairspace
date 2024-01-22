package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.Config;
import io.fairspace.saturn.config.ConfigLoader;
import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.rdf.transactions.TxnIndexDatasetGraph;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.services.metadata.validation.UniqueLabelValidator;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.workspaces.Workspace;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.webdav.DavFactory;
import io.fairspace.saturn.webdav.blobstore.BlobInfo;
import io.fairspace.saturn.webdav.blobstore.BlobStore;
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

import java.io.IOException;
import java.sql.SQLException;
import java.util.stream.Collectors;

import static io.fairspace.saturn.TestUtils.createTestUser;
import static io.fairspace.saturn.TestUtils.loadViewsConfig;
import static io.fairspace.saturn.TestUtils.mockAuthentication;
import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static org.apache.jena.query.DatasetFactory.wrap;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class ViewServiceTest {
    static final String BASE_PATH = "/api/webdav";
    static final String baseUri = ConfigLoader.CONFIG.publicUrl + BASE_PATH;

    @Mock
    BlobStore store;
    @Mock
    UserService userService;
    @Mock
    private MetadataPermissions permissions;
    MetadataService api;
    ViewService viewService;

    @Before
    public void before() throws SQLException, BadRequestException, ConflictException, NotAuthorizedException, IOException {
        var viewDatabase = buildViewDatabaseConfig();
        ViewsConfig config = loadViewsConfig("src/test/resources/test-views.yaml");
        ViewStoreClientFactory.H2_DATABASE = true;
        var viewStoreClientFactory = new ViewStoreClientFactory(config, viewDatabase);

        var dsg = new TxnIndexDatasetGraph(DatasetGraphFactory.createTxnMem(), viewStoreClientFactory);

        Dataset ds = wrap(dsg);

        loadTestData(ds);

        viewService = new ViewService(
                ConfigLoader.CONFIG.search,
                config,
                ds,
                viewStoreClientFactory,
                permissions);
    }

    @Test
    public void testFetchViewConfig() {
        when(permissions.canReadFacets()).thenReturn(true);
        var facets = viewService.getCachedFacets();
        var dateFacets = facets.stream()
                .filter(facet -> facet.getType() == ViewsConfig.ColumnType.Date)
                .toList();
        Assert.assertEquals(2, dateFacets.size());

        var boolFacets = facets.stream()
                .filter(facet -> facet.getType() == ViewsConfig.ColumnType.Boolean)
                .toList();
        Assert.assertEquals(1, boolFacets.size());
    }

    @Test
    public void testDisplayIndex_IsSet() {
        var views = viewService.getCachedViews();
        var columns = views.get(1).getColumns().stream().toList();
        var selectedColumn = columns.stream().filter(c -> c.getTitle().equals("Morphology")).collect(Collectors.toList()).get(0);
        Assert.assertEquals(Integer.valueOf(1), selectedColumn.getDisplayIndex());
    }

    @Test
    public void testDisplayIndex_IsNotSet() {
        var views = viewService.getCachedViews();
        var columns = views.get(1).getColumns().stream().toList();
        var selectedColumn = columns.stream().filter(c -> c.getTitle().equals("Laterality")).collect(Collectors.toList()).get(0);
        Assert.assertEquals(Integer.valueOf(Integer.MAX_VALUE), selectedColumn.getDisplayIndex());
    }

    @Test
    public void testFetchCachedFacets() {
        var sut = spy(viewService);
        when(permissions.canReadFacets()).thenReturn(true);

        var facets = viewService.getCachedFacets();
        Assert.assertEquals(facets.size(), 11);
        verify(sut, never()).fetchFacets();
    }


    @Test
    public void testFetchCachedViews() {
        var sut = spy(viewService);

        var views = viewService.getCachedViews();
        Assert.assertEquals(views.size(), 4);
        verify(sut, never()).fetchViews();
    }

    private Config.ViewDatabase buildViewDatabaseConfig() {
        var viewDatabase = new Config.ViewDatabase();
        viewDatabase.url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE";
        viewDatabase.username = "sa";
        viewDatabase.password = "";
        return viewDatabase;
    }

    private void loadTestData(Dataset ds) throws NotAuthorizedException, BadRequestException, ConflictException, IOException {
        // TODO: loaded data to be mocked instead of loading them this way
        Transactions tx = new SimpleTransactions(ds);
        Model model = ds.getDefaultModel();
        var vocabulary = model.read("test-vocabulary.ttl");

        var workspaceService = new WorkspaceService(tx, userService);

        var context = new Context();

        var davFactory = new DavFactory(model.createResource(baseUri), store, userService, context);

        when(permissions.canWriteMetadata(any())).thenReturn(true);
        api = new MetadataService(tx, vocabulary, new ComposedValidator(new UniqueLabelValidator()), permissions);

        setupRequestContext();
        var request = getCurrentRequest();

        var taxonomies = model.read("test-taxonomies.ttl");
        api.put(taxonomies);

        User user = createTestUser("user", true);
        Authentication.User userAuthentication = mockAuthentication("admin");
        lenient().when(request.getAuthentication()).thenReturn(userAuthentication);
        lenient().when(userService.currentUser()).thenReturn(user);

        var workspace = workspaceService.createWorkspace(Workspace.builder().code("Test").build());

        when(request.getHeader("Owner")).thenReturn(workspace.getIri().getURI());
        when(request.getAttribute("BLOB")).thenReturn(new BlobInfo("id", 0, "md5"));

        var root = (MakeCollectionableResource) ((ResourceFactory) davFactory).getResource(null, BASE_PATH);
        var coll1 = (PutableResource) root.createCollection("coll1");
        coll1.createNew("coffee.jpg", null, 0L, "image/jpeg");

        var testdata = model.read("testdata.ttl");
        api.put(testdata);
    }
}
