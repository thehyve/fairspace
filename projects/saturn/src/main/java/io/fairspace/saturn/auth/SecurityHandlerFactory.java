package io.fairspace.saturn.auth;

import io.fairspace.saturn.config.Config;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.util.security.Constraint;
import org.keycloak.adapters.AdapterTokenStore;
import org.keycloak.adapters.KeycloakDeployment;
import org.keycloak.adapters.jetty.Jetty94RequestAuthenticator;
import org.keycloak.adapters.jetty.KeycloakJettyAuthenticator;
import org.keycloak.adapters.jetty.core.JettyRequestAuthenticator;
import org.keycloak.adapters.jetty.spi.JettyHttpFacade;
import org.keycloak.adapters.spi.AuthChallenge;
import org.keycloak.adapters.spi.HttpFacade;
import org.keycloak.common.enums.SslRequired;
import org.keycloak.enums.TokenStore;
import org.keycloak.representations.adapters.config.AdapterConfig;

import java.util.Map;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static java.lang.System.getenv;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

public class SecurityHandlerFactory {
    public static SecurityHandler createSecurityHandler(Config.Auth config) {
        var securityHandler = new ConstraintSecurityHandler();
        var authenticator = new KeycloakJettyAuthenticator() {
            @Override
            protected JettyRequestAuthenticator createRequestAuthenticator(Request request, JettyHttpFacade facade, KeycloakDeployment deployment, AdapterTokenStore tokenStore) {
                return new Jetty94RequestAuthenticator(facade, deployment, tokenStore, -1, request) {
                    @Override
                    public AuthChallenge getChallenge() {
                        // No redirects for API requests
                        if (request.getOriginalURI().startsWith("/api/")) {
                            return new AuthChallenge() {
                                @Override
                                public boolean challenge(HttpFacade exchange) {
                                    exchange.getResponse().setStatus(getResponseCode());
                                    return true;
                                }

                                @Override
                                public int getResponseCode() {
                                    return SC_UNAUTHORIZED;
                                }
                            };
                        }

                        return super.getChallenge();
                    }
                };
            }
        };
        var adapterConfig = new AdapterConfig();
        adapterConfig.setResource(config.clientId);
        adapterConfig.setRealm(config.realm);
        adapterConfig.setAuthServerUrl(CONFIG.auth.authServerUrl);
        adapterConfig.setTokenStore(TokenStore.SESSION.name());
        adapterConfig.setCredentials(Map.of("secret",  getenv("KEYCLOAK_CLIENT_SECRET")));
        authenticator.setAdapterConfig(adapterConfig);
        securityHandler.setAuthenticator(authenticator);
        var localhost = CONFIG.auth.authServerUrl.startsWith("http://localhost:");
        adapterConfig.setSslRequired((localhost ? SslRequired.NONE : SslRequired.EXTERNAL).name());
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
