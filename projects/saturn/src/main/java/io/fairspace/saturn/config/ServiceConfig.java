package io.fairspace.saturn.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.fairspace.saturn.config.properties.CacheProperties;
import io.fairspace.saturn.config.properties.FeatureProperties;
import io.fairspace.saturn.config.properties.JenaProperties;
import io.fairspace.saturn.config.properties.KeycloakClientProperties;
import io.fairspace.saturn.config.properties.SearchProperties;
import io.fairspace.saturn.config.properties.ViewDatabaseProperties;
import io.fairspace.saturn.config.properties.WebDavProperties;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.rdf.transactions.BulkTransactions;
import io.fairspace.saturn.rdf.transactions.SimpleTransactions;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.fairspace.saturn.services.IRIModule;
import io.fairspace.saturn.services.metadata.MetadataPermissions;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.views.SparqlQueryService;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;
import io.fairspace.saturn.webdav.DavFactory;
import io.fairspace.saturn.webdav.WebDAVServlet;
import io.fairspace.saturn.webdav.blobstore.BlobStore;
import io.fairspace.saturn.webdav.blobstore.LocalBlobStore;
import lombok.RequiredArgsConstructor;
import org.apache.jena.query.Dataset;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.UsersResource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.Nullable;

import java.io.File;
import java.sql.SQLException;

import static com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES;
import static com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS;
import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;

@Configuration
@RequiredArgsConstructor
public class ServiceConfig {

    @Value("${application.publicUrl}")
    private String publicUrl;

    // todo: make the init done by Spring
    @Bean
    public Services getService(
            UserService userService,
            @Nullable ViewStoreClientFactory viewStoreClientFactory,
            FeatureProperties featureProperties,
            JenaProperties jenaProperties,
            CacheProperties cacheProperties,
            SearchProperties searchProperties,
            WebDavProperties webDavProperties,
            Transactions transactions,
            Dataset dataset,
            MetadataPermissions metadataPermissions,
            DavFactory davFactory) {
        return new Services(
                userService,
                VIEWS_CONFIG,
                dataset,
                featureProperties,
                viewStoreClientFactory,
                jenaProperties,
                cacheProperties,
                searchProperties,
                webDavProperties,
                transactions,
                metadataPermissions,
                davFactory,
                publicUrl);
    }

    @Bean
    public UsersResource getUsersResource(Keycloak keycloak, KeycloakClientProperties keycloakClientProperties) {
        return keycloak.realm(keycloakClientProperties.getRealm()).users();
    }

    @Bean
    public Dataset getDataset(JenaProperties jenaProperties, @Nullable ViewStoreClientFactory viewStoreClientFactory) {
        return SaturnDatasetFactory.connect(jenaProperties, viewStoreClientFactory, publicUrl);
    }

    @Bean
    public Transactions getTransactions(JenaProperties jenaProperties, Dataset dataset) {
        return jenaProperties.isBulkTransactions() ? new BulkTransactions(dataset) : new SimpleTransactions(dataset);

    }

    @Bean
    public UserService getUserService(KeycloakClientProperties keycloakClientProperties, Transactions transactions, UsersResource usersResource) {
        return new UserService(keycloakClientProperties, transactions, usersResource);
    }

    @Bean
    public BlobStore getBlobStore(WebDavProperties webDavProperties) {
        return new LocalBlobStore(new File(webDavProperties.getBlobStorePath()));
    }

    @Bean
    public DavFactory getDavFactory(Dataset dataset, BlobStore blobStore, UserService userService, WebDavProperties webDavProperties) {
        return new DavFactory(
                dataset.getDefaultModel().createResource(publicUrl + "/api/webdav"),
                blobStore,
                userService,
                dataset.getContext(),
                webDavProperties);
    }

    @Bean
    public WebDAVServlet getWebDavServlet(DavFactory davFactory, Transactions transactions, BlobStore blobStore) {
        return new WebDAVServlet(davFactory, transactions, blobStore);
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
    public SparqlQueryService getSparqlQueryService(Services services) {
        return services.getSparqlQueryService();
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
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new IRIModule())
                .registerModule(new JavaTimeModule())
                .configure(WRITE_DATES_AS_TIMESTAMPS, false)
                .configure(FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
