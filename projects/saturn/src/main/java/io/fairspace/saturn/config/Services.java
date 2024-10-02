package io.fairspace.saturn.config;

import java.io.File;

import io.milton.resource.Resource;
import lombok.Getter;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.apache.jena.query.Dataset;
import org.apache.jena.sparql.core.DatasetGraph;
import org.apache.jena.sparql.core.DatasetImpl;
import org.apache.jena.sparql.util.Symbol;
import org.keycloak.admin.client.resource.UsersResource;

import io.fairspace.saturn.config.properties.CacheProperties;
import io.fairspace.saturn.config.properties.FeatureProperties;
import io.fairspace.saturn.config.properties.JenaProperties;
import io.fairspace.saturn.config.properties.KeycloakClientProperties;
import io.fairspace.saturn.config.properties.SearchProperties;
import io.fairspace.saturn.config.properties.WebDavProperties;
import io.fairspace.saturn.rdf.search.FilteredDatasetGraph;
import io.fairspace.saturn.rdf.transactions.BulkTransactions;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
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
import io.fairspace.saturn.services.search.FileSearchService;
import io.fairspace.saturn.services.search.JdbcFileSearchService;
import io.fairspace.saturn.services.search.SearchService;
import io.fairspace.saturn.services.search.SparqlFileSearchService;
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

import static io.fairspace.saturn.services.views.ViewStoreClientFactory.protectedResources;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;

@Log4j2
@Getter
// TODO: get rid of the Services class as it makes no sense to have a class that contains all services implementing IoC
public class Services {

    public static final Symbol METADATA_SERVICE = Symbol.create("metadata_service");

    private final Transactions transactions;

    private final WorkspaceService workspaceService;
    private final UserService userService;
    private final MetadataPermissions metadataPermissions;
    private final MetadataService metadataService;
    private final ViewService viewService;
    private final QueryService queryService;
    private final SparqlQueryService sparqlQueryService;
    private final SearchService searchService;
    private final FileSearchService fileSearchService;
    private final BlobStore blobStore;
    private final DavFactory davFactory;
    private final WebDAVServlet davServlet;

    private final BlobStore extraBlobStore;
    private final DavFactory extraDavFactory;
    private final WebDAVServlet extraDavServlet;
    private final DatasetGraph filteredDatasetGraph;
    private final MaintenanceService maintenanceService;

    public Services(
            @NonNull ViewsConfig viewsConfig,
            @NonNull Dataset dataset,
            FeatureProperties featureProperties,
            ViewStoreClientFactory viewStoreClientFactory,
            UsersResource usersResource,
            JenaProperties jenaProperties,
            CacheProperties cacheProperties,
            SearchProperties searchProperties,
            WebDavProperties webDavProperties,
            KeycloakClientProperties keycloakClientProperties,
            String publicUrl) {
        this.transactions =
                jenaProperties.isBulkTransactions() ? new BulkTransactions(dataset) : new SimpleTransactions(dataset);

        userService = new UserService(keycloakClientProperties, transactions, usersResource);

        blobStore = new LocalBlobStore(new File(webDavProperties.getBlobStorePath()));
        davFactory = new DavFactory(
                dataset.getDefaultModel().createResource(publicUrl + "/api/webdav"),
                blobStore,
                userService,
                dataset.getContext(),
                webDavProperties);
        davServlet = new WebDAVServlet(davFactory, transactions, blobStore);

        if (featureProperties.getFeatures().contains(Feature.ExtraStorage)) {
            extraBlobStore = new DeletableLocalBlobStore(
                    new File(webDavProperties.getExtraStorage().getBlobStorePath()));
            extraDavFactory = new DavFactory(
                    dataset.getDefaultModel().createResource(publicUrl + "/api/extra-storage"),
                    extraBlobStore,
                    userService,
                    dataset.getContext(),
                    webDavProperties);
            extraDavServlet = new WebDAVServlet(extraDavFactory, transactions, extraBlobStore);
            initExtraStorageRootDirectories(webDavProperties.getExtraStorage());
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

        sparqlQueryService = new SparqlQueryService(searchProperties, viewsConfig, filteredDataset, transactions);
        queryService = viewStoreClientFactory == null
                ? new SparqlQueryService(searchProperties, viewsConfig, filteredDataset, transactions)
                : new JdbcQueryService(
                        searchProperties, viewsConfig, viewStoreClientFactory, transactions, davFactory.root);

        // File search should be done using JDBC for performance reasons. However, if the view store is not available,
        // or collections and files view is not configured, we fall back to using SPARQL queries on the RDF database
        // directly.
        boolean useSparqlFileSearchService = viewStoreClientFactory == null
                || viewsConfig.views.stream().noneMatch(view -> protectedResources.containsAll(view.types));

        fileSearchService = useSparqlFileSearchService
                ? new SparqlFileSearchService(filteredDataset)
                : new JdbcFileSearchService(
                        searchProperties, viewsConfig, viewStoreClientFactory, transactions, davFactory.root);

        viewService = new ViewService(
                searchProperties,
                cacheProperties,
                viewsConfig,
                filteredDataset,
                viewStoreClientFactory,
                metadataPermissions);

        maintenanceService =
                new MaintenanceService(userService, dataset, viewStoreClientFactory, viewService, publicUrl);

        searchService = new SearchService(filteredDataset);
    }

    private void initExtraStorageRootDirectories(WebDavProperties.ExtraStorage extraStorage) {
        this.transactions.calculateWrite(ds2 -> {
            for (var rc : extraStorage.getDefaultRootCollections()) {
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
