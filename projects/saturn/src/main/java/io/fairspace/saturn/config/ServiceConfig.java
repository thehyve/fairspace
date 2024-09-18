package io.fairspace.saturn.config;

import java.sql.SQLException;

import lombok.RequiredArgsConstructor;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.Nullable;

import io.fairspace.saturn.config.properties.CacheProperties;
import io.fairspace.saturn.config.properties.FeatureProperties;
import io.fairspace.saturn.config.properties.JenaProperties;
import io.fairspace.saturn.config.properties.KeycloakClientProperties;
import io.fairspace.saturn.config.properties.SearchProperties;
import io.fairspace.saturn.config.properties.ViewDatabaseProperties;
import io.fairspace.saturn.config.properties.WebDavProperties;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.views.SparqlQueryService;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;

import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;

/**
 * Configuration for the Spark filter to enable the Saturn API.
 */
@Configuration
@RequiredArgsConstructor
public class ServiceConfig {

    // todo: make the init done by Spring
    @Bean
    public Services getService(
            Keycloak keycloak,
            @Nullable ViewStoreClientFactory viewStoreClientFactory,
            FeatureProperties featureProperties,
            JenaProperties jenaProperties,
            CacheProperties cacheProperties,
            SearchProperties searchProperties,
            WebDavProperties webDavProperties,
            KeycloakClientProperties keycloakClientProperties,
            @Value("${application.publicUrl}") String publicUrl) {
        var ds = SaturnDatasetFactory.connect(jenaProperties, viewStoreClientFactory, publicUrl);
        return new Services(
                VIEWS_CONFIG,
                ds,
                featureProperties,
                viewStoreClientFactory,
                keycloak.realm(keycloakClientProperties.getRealm()).users(),
                jenaProperties,
                cacheProperties,
                searchProperties,
                webDavProperties,
                keycloakClientProperties,
                publicUrl);
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
    public UserService getUserService(Services services) {
        return services.getUserService();
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
}
