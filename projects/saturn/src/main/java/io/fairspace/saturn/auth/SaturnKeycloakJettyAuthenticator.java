package io.fairspace.saturn.auth;

import org.eclipse.jetty.server.Request;
import org.keycloak.adapters.AdapterTokenStore;
import org.keycloak.adapters.KeycloakDeployment;
import org.keycloak.adapters.jetty.Jetty94RequestAuthenticator;
import org.keycloak.adapters.jetty.KeycloakJettyAuthenticator;
import org.keycloak.adapters.jetty.core.JettyRequestAuthenticator;
import org.keycloak.adapters.jetty.spi.JettyHttpFacade;
import org.keycloak.adapters.spi.AuthChallenge;
import org.keycloak.adapters.spi.HttpFacade;
import org.keycloak.representations.adapters.config.AdapterConfig;

import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

class SaturnKeycloakJettyAuthenticator extends KeycloakJettyAuthenticator {
    SaturnKeycloakJettyAuthenticator(AdapterConfig config) {
        setAdapterConfig(config);
    }

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
}
