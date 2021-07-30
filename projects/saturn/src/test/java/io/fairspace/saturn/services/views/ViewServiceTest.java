package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
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
import java.util.stream.*;

import static io.fairspace.saturn.TestUtils.*;
import static io.fairspace.saturn.TestUtils.mockAuthentication;
import static io.fairspace.saturn.auth.RequestContext.getCurrentRequest;
import static io.fairspace.saturn.config.Services.*;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;
import static org.apache.jena.query.DatasetFactory.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
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
        var viewDatabase = new Config.ViewDatabase();
        viewDatabase.url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE";
        viewDatabase.username = "sa";
        viewDatabase.password = "";
        ViewsConfig config = ConfigLoader.VIEWS_CONFIG;
        ViewStoreClientFactory.H2_DATABASE = true;
        var viewStoreClientFactory = new ViewStoreClientFactory(config, viewDatabase);

        var dsg = new TxnIndexDatasetGraph(DatasetGraphFactory.createTxnMem(), viewStoreClientFactory);

        Dataset ds = wrap(dsg);
        Transactions tx = new SimpleTransactions(ds);
        Model model = ds.getDefaultModel();

        var workspaceService = new WorkspaceService(tx, userService);

        var context = new Context();

        var davFactory = new DavFactory(model.createResource(baseUri), store, userService, context);
        ds.getContext().set(FS_ROOT, davFactory.root);

        viewService = new ViewService(ConfigLoader.CONFIG.search, ConfigLoader.VIEWS_CONFIG, ds, viewStoreClientFactory);

        when(permissions.canWriteMetadata(any())).thenReturn(true);
        api = new MetadataService(tx, VOCABULARY, new ComposedValidator(new UniqueLabelValidator()), permissions);

        setupRequestContext();
        var request = getCurrentRequest();

        var taxonomies = model.read("taxonomies.ttl");
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

    @Test
    public void testFetchViewConfig() {
        var facets = viewService.getFacets();
        var dateFacets = facets.stream()
                .filter(facet -> facet.getType() == ViewsConfig.ColumnType.Date)
                .collect(Collectors.toList());
        Assert.assertEquals(1, dateFacets.size());
        viewService.getViews();
    }
}
