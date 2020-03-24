package io.fairspace.saturn.auth;

import io.fairspace.saturn.config.Config;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.util.security.Constraint;
import org.keycloak.adapters.jetty.KeycloakJettyAuthenticator;
import org.keycloak.common.enums.SslRequired;
import org.keycloak.enums.TokenStore;
import org.keycloak.representations.adapters.config.AdapterConfig;

import java.util.Map;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static java.lang.System.getenv;

public class SecurityHandlerFactory {
    public static SecurityHandler createSecurityHandler(Config.Auth config) {
        var securityHandler = new ConstraintSecurityHandler();
        var authenticator = new KeycloakJettyAuthenticator();
        var adapterConfig = new AdapterConfig();
        adapterConfig.setResource(config.clientId);
        adapterConfig.setRealm(config.realm);
        adapterConfig.setAuthServerUrl(CONFIG.auth.authServerUrl);
        adapterConfig.setTokenStore(TokenStore.COOKIE.name());
        adapterConfig.setCredentials(Map.of("secret",  getenv("KEYCLOAK_CLIENT_SECRET")));
        authenticator.setAdapterConfig(adapterConfig);
        securityHandler.setAuthenticator(authenticator);
        var localhost = CONFIG.auth.authServerUrl.startsWith("http://localhost:");
        adapterConfig.setSslRequired((localhost ? SslRequired.NONE : SslRequired.ALL).name());
        if(!localhost) {
            adapterConfig.setConfidentialPort(443);
        }

        var constraint = new Constraint("any", Constraint.ANY_AUTH);
        constraint.setAuthenticate(true);

        var mapping = new ConstraintMapping();
        mapping.setConstraint(constraint);
        mapping.setPathSpec("/*");
        securityHandler.addConstraintMapping(mapping);

        constraint = new Constraint("health", Constraint.ANY_AUTH);
        constraint.setAuthenticate(false);
        mapping = new ConstraintMapping();
        mapping.setConstraint(constraint);
        mapping.setPathSpec("/api/v1/health/");
        securityHandler.addConstraintMapping(mapping);

        return securityHandler;
    }
}
