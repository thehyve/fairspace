package io.fairspace.saturn.services.views;

import io.fairspace.saturn.config.*;
import io.fairspace.saturn.rdf.transactions.*;
import io.fairspace.saturn.services.mail.*;
import io.fairspace.saturn.services.metadata.*;
import io.fairspace.saturn.services.metadata.validation.*;
import io.fairspace.saturn.services.users.*;
import io.fairspace.saturn.webdav.*;
import org.apache.jena.query.*;
import org.apache.jena.rdf.model.*;
import org.apache.jena.sparql.core.*;
import org.apache.jena.sparql.util.*;
import org.junit.*;
import org.junit.runner.*;
import org.mockito.*;
import org.mockito.junit.*;

import static io.fairspace.saturn.TestUtils.*;
import static io.fairspace.saturn.config.Services.*;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;
import static org.apache.jena.query.DatasetFactory.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class ViewServiceTest {
    static final String BASE_PATH = "/api/v1/webdav";
    static final String baseUri = "http://example.com" + BASE_PATH;

    @Mock
    BlobStore store;
    @Mock
    UserService userService;
    @Mock
    MailService mailService;
    @Mock
    private MetadataPermissions permissions;
    MetadataService api;
    ViewService viewService;

    @Before
    public void before() {
        var dsg = DatasetGraphFactory.createTxnMem();
        Dataset ds = wrap(dsg);
        Transactions tx = new SimpleTransactions(ds);
        Model model = ds.getDefaultModel();

        var context = new Context();

        var davFactory = new DavFactory(model.createResource(baseUri), store, userService, mailService, context);
        ds.getContext().set(FS_ROOT, davFactory.root);

        viewService = new ViewService(ConfigLoader.VIEWS_CONFIG, ds, davFactory);

        when(permissions.canWriteMetadata(any())).thenReturn(true);
        api = new MetadataService(tx, VOCABULARY, new ComposedValidator(new UniqueLabelValidator()), permissions);

        setupRequestContext();

        var taxonomies = model.read("taxonomies.ttl");
        api.put(taxonomies);

        var testdata = model.read("testdata.ttl");
        api.put(testdata);
    }

    @Test
    public void testFetchViewConfig() {
        viewService.getFacets();
        viewService.getViews();
    }

}
