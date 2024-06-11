package io.fairspace.saturn.config;

import java.io.File;

import io.milton.resource.Resource;
import jakarta.servlet.http.HttpServlet;
import lombok.Getter;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.jena.query.Dataset;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetImpl;
import org.apache.jena.sparql.util.Symbol;

import io.fairspace.saturn.rdf.search.FilteredDatasetGraph;
import io.fairspace.saturn.rdf.transactions.BulkTransactions;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.health.HealthService;
import io.fairspace.saturn.services.maintenance.MaintenanceService;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.metadata.validation.ComposedValidator;
import io.fairspace.saturn.services.metadata.validation.DeletionValidator;
import io.fairspace.saturn.services.metadata.validation.MachineOnlyClassesValidator;
import io.fairspace.saturn.services.metadata.validation.ProtectMachineOnlyPredicatesValidator;
import io.fairspace.saturn.services.metadata.validation.ShaclValidator;
import io.fairspace.saturn.services.metadata.validation.URIPrefixValidator;
import io.fairspace.saturn.services.metadata.validation.UniqueLabelValidator;
import io.fairspace.saturn.services.search.SearchService;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.views.JdbcQueryService;
import io.fairspace.saturn.services.views.QueryService;
import io.fairspace.saturn.services.views.SparqlQueryService;
import io.fairspace.saturn.services.views.ViewService;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.webdav.DavFactory;
import io.fairspace.saturn.webdav.WebDAVServlet;
import io.fairspace.saturn.webdav.blobstore.BlobStore;
import io.fairspace.saturn.webdav.blobstore.DeletableLocalBlobStore;
import io.fairspace.saturn.webdav.blobstore.LocalBlobStore;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;

@Log4j2
@Getter
public class Services {
    public static final Symbol METADATA_SERVICE = Symbol.create("metadata_service");

    private final Config config;
    private final Transactions transactions;

    private final WorkspaceService workspaceService;
    private final UserService userService;
    private final MetadataPermissions metadataPermissions;
    private final MetadataService metadataService;
    private final ViewService viewService;
    private final QueryService queryService;
    private final SearchService searchService;
    private final BlobStore blobStore;
    private final DavFactory davFactory;
    private final HttpServlet davServlet;

    private final BlobStore extraBlobStore;
    private final DavFactory extraDavFactory;
    private final HttpServlet extraDavServlet;
    private final DatasetGraph filteredDatasetGraph;
    private final HealthService healthService;
    private final MaintenanceService maintenanceService;

    public Services(
            @NonNull Config config,
            @NonNull ViewsConfig viewsConfig,
            @NonNull Dataset dataset,
            ViewStoreClientFactory viewStoreClientFactory) {
        this.config = config;
        this.transactions =
                config.jena.bulkTransactions ? new BulkTransactions(dataset) : new SimpleTransactions(dataset);

        userService = new UserService(config.auth, transactions);

        blobStore = new LocalBlobStore(new File(config.webDAV.blobStorePath));
        davFactory = new DavFactory(
                dataset.getDefaultModel().createResource(config.publicUrl + "/api/webdav"),
                blobStore,
                userService,
                dataset.getContext());
        davServlet = new WebDAVServlet(davFactory, transactions, blobStore);

        if (CONFIG.features.contains(Feature.ExtraStorage)) {
            extraBlobStore = new DeletableLocalBlobStore(new File(config.extraStorage.blobStorePath));
            extraDavFactory = new DavFactory(
                    dataset.getDefaultModel().createResource(config.publicUrl + "/api/extra-storage"),
                    extraBlobStore,
                    userService,
                    dataset.getContext());
            extraDavServlet = new WebDAVServlet(extraDavFactory, transactions, extraBlobStore);
            initExtraStorageRootDirectories();
        } else {
            extraBlobStore = null;
            extraDavFactory = null;
            extraDavServlet = null;
        }

        workspaceService = new WorkspaceService(transactions, userService);

        metadataPermissions = new MetadataPermissions(workspaceService, davFactory, userService);

        var metadataValidator = new ComposedValidator(
                new MachineOnlyClassesValidator(VOCABULARY),
                new ProtectMachineOnlyPredicatesValidator(VOCABULARY),
                new URIPrefixValidator(((Resource) davFactory.root).getUniqueId()),
                new DeletionValidator(),
                new UniqueLabelValidator(),
                new ShaclValidator(VOCABULARY));

        metadataService = new MetadataService(transactions, VOCABULARY, metadataValidator, metadataPermissions);
        dataset.getContext().set(METADATA_SERVICE, metadataService);

        filteredDatasetGraph = new FilteredDatasetGraph(dataset.asDatasetGraph(), metadataPermissions);
        var filteredDataset = DatasetImpl.wrap(filteredDatasetGraph);

        queryService = viewStoreClientFactory == null
                ? new SparqlQueryService(config.search, viewsConfig, filteredDataset)
                : new JdbcQueryService(config.search, viewStoreClientFactory, transactions, davFactory.root);
        viewService =
                new ViewService(config, viewsConfig, filteredDataset, viewStoreClientFactory, metadataPermissions);

        maintenanceService = new MaintenanceService(userService, dataset, viewStoreClientFactory, viewService);

        searchService = new SearchService(filteredDataset);

        healthService = new HealthService(viewStoreClientFactory == null ? null : viewStoreClientFactory.dataSource);
    }

    private void initExtraStorageRootDirectories() {
        this.transactions.calculateWrite(ds2 -> {
            for (var rc : CONFIG.extraStorage.defaultRootCollections) {
                try {
                    extraDavFactory.root.createCollection(rc);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
            return null;
        });
    }
}
