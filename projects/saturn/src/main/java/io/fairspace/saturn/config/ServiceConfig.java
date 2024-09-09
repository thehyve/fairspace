package io.fairspace.saturn.config;

import java.sql.SQLException;

import io.fairspace.saturn.config.properties.FeatureProperties;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.views.SparqlQueryService;
import lombok.RequiredArgsConstructor;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.fairspace.saturn.auth.KeycloakClientProperties;
import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;

/**
 * Configuration for the Spark filter to enable the Saturn API.
 */
@Configuration
@RequiredArgsConstructor
public class ServiceConfig {

    private final KeycloakClientProperties keycloakClientProperties;

    // todo: make the init done by Spring
    @Bean
    public Services getService(Keycloak keycloak, FeatureProperties featureProperties) {
        ViewStoreClientFactory viewStoreClientFactory = null;
        if (CONFIG.viewDatabase.enabled) {
            try {
                viewStoreClientFactory = new ViewStoreClientFactory(VIEWS_CONFIG, CONFIG.viewDatabase, CONFIG.search);
            } catch (SQLException e) {
                throw new RuntimeException("Error connecting to the view database", e);
            }
        }
        var ds = SaturnDatasetFactory.connect(CONFIG.jena, viewStoreClientFactory);

        return new Services(
                CONFIG,
                VIEWS_CONFIG,
                ds,
                featureProperties,
                viewStoreClientFactory,
                keycloak.realm(keycloakClientProperties.getRealm()).users());
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
    public Keycloak getKeycloak() {
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
