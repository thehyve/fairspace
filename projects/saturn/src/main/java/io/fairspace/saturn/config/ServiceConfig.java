package io.fairspace.saturn.config;

import java.sql.SQLException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.apache.jena.query.Dataset;
import org.apache.jena.sparql.core.DatasetImpl;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UsersResource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.Nullable;

import io.fairspace.saturn.config.properties.CacheProperties;
import io.fairspace.saturn.config.properties.JenaProperties;
import io.fairspace.saturn.config.properties.KeycloakClientProperties;
import io.fairspace.saturn.config.properties.SearchProperties;
import io.fairspace.saturn.config.properties.ViewDatabaseProperties;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.rdf.search.FilteredDatasetGraph;
import io.fairspace.saturn.rdf.transactions.BulkTransactions;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.IRIModule;
import io.fairspace.saturn.services.maintenance.MaintenanceService;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
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
import io.fairspace.saturn.webdav.DavFactory;

import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;
import static io.fairspace.saturn.services.views.ViewStoreClientFactory.protectedResources;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;

@Configuration
@RequiredArgsConstructor
public class ServiceConfig {

    @Value("${application.publicUrl}")
    private String publicUrl;

    @Bean
    public UsersResource getUsersResource(Keycloak keycloak, KeycloakClientProperties keycloakClientProperties) {
        return keycloak.realm(keycloakClientProperties.getRealm()).users();
    }

    @Bean
    @Qualifier("dataset")
    public Dataset getDataset(JenaProperties jenaProperties, @Nullable ViewStoreClientFactory viewStoreClientFactory) {
        return SaturnDatasetFactory.connect(jenaProperties, viewStoreClientFactory, publicUrl);
    }

    @Bean
    @Qualifier("filteredDataset")
    public Dataset getFilteredDataset(Dataset dataset, MetadataPermissions metadataPermissions) {
        var filteredDatasetGraph = new FilteredDatasetGraph(dataset.asDatasetGraph(), metadataPermissions);
        return DatasetImpl.wrap(filteredDatasetGraph);
    }

    @Bean
    public Transactions getTransactions(JenaProperties jenaProperties, @Qualifier("dataset") Dataset dataset) {
        return jenaProperties.isBulkTransactions() ? new BulkTransactions(dataset) : new SimpleTransactions(dataset);
    }

    @Bean
    public UserService getUserService(
            KeycloakClientProperties keycloakClientProperties, Transactions transactions, UsersResource usersResource) {
        return new UserService(keycloakClientProperties, transactions, usersResource);
    }

    @Bean
    public ViewService getViewService(
            SearchProperties searchProperties,
            CacheProperties cacheProperties,
            @Qualifier("filteredDataset") Dataset filteredDataset,
            @Nullable ViewStoreClientFactory viewStoreClientFactory,
            MetadataPermissions metadataPermissions) {
        return new ViewService(
                searchProperties,
                cacheProperties,
                VIEWS_CONFIG,
                filteredDataset,
                viewStoreClientFactory,
                metadataPermissions);
    }

    @Bean
    public MaintenanceService getMaintenanceService(
            UserService userService,
            @Qualifier("dataset") Dataset dataset,
            @Nullable ViewStoreClientFactory viewStoreClientFactory,
            ViewService viewService) {
        return new MaintenanceService(userService, dataset, viewStoreClientFactory, viewService, publicUrl);
    }

    @Bean
    @ConditionalOnProperty(value = "application.view-database.enabled", havingValue = "true")
    public ViewStoreClientFactory getViewStoreClientFactory(
            ViewDatabaseProperties viewDatabaseProperties, SearchProperties searchProperties) {
        try {
            return new ViewStoreClientFactory(VIEWS_CONFIG, viewDatabaseProperties, searchProperties);
        } catch (SQLException e) {
            throw new RuntimeException("Error connecting to the view database", e);
        }
    }

    @Bean
    @Qualifier("sparqlQueryService")
    public SparqlQueryService getSparqlQueryService(
            SearchProperties searchProperties,
            JenaProperties jenaProperties,
            @Qualifier("filteredDataset") Dataset filteredDataset,
            Transactions transactions) {
        return new SparqlQueryService(searchProperties, jenaProperties, VIEWS_CONFIG, filteredDataset, transactions);
    }

    @Bean
    @Qualifier("queryService")
    public QueryService getQueryService(
            SparqlQueryService sparqlQueryService,
            SearchProperties searchProperties,
            @Nullable ViewStoreClientFactory viewStoreClientFactory,
            Transactions transactions,
            @Qualifier("davFactory") DavFactory davFactory) {
        return viewStoreClientFactory == null
                ? sparqlQueryService
                : new JdbcQueryService(
                        searchProperties, VIEWS_CONFIG, viewStoreClientFactory, transactions, davFactory.root);
    }

    @Bean
    public Keycloak getKeycloak(KeycloakClientProperties keycloakClientProperties) {
        return KeycloakBuilder.builder()
                .serverUrl(keycloakClientProperties.getAuthServerUrl())
                .realm(keycloakClientProperties.getRealm())
                .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
                .clientId(keycloakClientProperties.getClientId())
                .clientSecret(keycloakClientProperties.getClientSecret())
                .username(keycloakClientProperties.getClientId())
                .password(keycloakClientProperties.getClientSecret())
                .build();
    }

    @Bean
    public SearchService getSearchService(@Qualifier("filteredDataset") Dataset filteredDataset) {
        return new SearchService(filteredDataset);
    }

    @Bean
    public FileSearchService getFileSearchService(
            @Qualifier("filteredDataset") Dataset filteredDataset,
            @Nullable ViewStoreClientFactory viewStoreClientFactory,
            SearchProperties searchProperties,
            Transactions transactions,
            @Qualifier("davFactory") DavFactory davFactory) {
        // File search should be done using JDBC for performance reasons. However, if the view store is not available,
        // or collections and files view is not configured, we fall back to using SPARQL queries on the RDF database
        // directly.
        boolean useSparqlFileSearchService = viewStoreClientFactory == null
                || VIEWS_CONFIG.views.stream().noneMatch(view -> protectedResources.containsAll(view.types));

        return useSparqlFileSearchService
                ? new SparqlFileSearchService(filteredDataset)
                : new JdbcFileSearchService(
                        searchProperties, VIEWS_CONFIG, viewStoreClientFactory, transactions, davFactory.root);
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new IRIModule())
                .registerModule(new JavaTimeModule())
                .configure(WRITE_DATES_AS_TIMESTAMPS, false)
                .configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
