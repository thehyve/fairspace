package io.fairspace.saturn.auth;

import java.io.*;
import java.util.*;
import javax.security.cert.*;
import javax.servlet.ServletRequest;

import org.eclipse.jetty.http.*;
import org.eclipse.jetty.server.Request;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.AdapterTokenStore;
import org.keycloak.adapters.KeycloakDeployment;
import org.keycloak.adapters.RefreshableKeycloakSecurityContext;
import org.keycloak.adapters.jetty.Jetty94RequestAuthenticator;
import org.keycloak.adapters.jetty.KeycloakJettyAuthenticator;
import org.keycloak.adapters.jetty.core.JettyRequestAuthenticator;
import org.keycloak.adapters.jetty.spi.JettyHttpFacade;
import org.keycloak.adapters.spi.*;
import org.keycloak.common.util.*;
import org.keycloak.representations.adapters.config.AdapterConfig;

import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

class SaturnKeycloakJettyAuthenticator extends KeycloakJettyAuthenticator {
    /**
     * Reads the X-Forwarded-Proto header from the request, if set,
     * and uses that value to determine the URI and the security of the request.
     */
    static class ProxiedRequestWrapper implements HttpFacade.Request {
        final HttpFacade.Request request;

        public ProxiedRequestWrapper(HttpFacade.Request request) {
            this.request = request;
        }

        @Override
        public String getMethod() {
            return request.getMethod();
        }

        @Override
        public String getURI() {
            var uri = request.getURI();
            var uriBuilder = KeycloakUriBuilder.fromUri(uri);
            if (isSecure() && HttpScheme.HTTP.is(uriBuilder.getScheme())) {
                return uriBuilder.scheme("https").port(-1).build().toString();
            }
            return request.getURI();
        }

        @Override
        public String getRelativePath() {
            return request.getRelativePath();
        }

        @Override
        public boolean isSecure() {
            return request.isSecure() || HttpScheme.HTTPS.is(getHeader("x-forwarded-proto"));
        }

        @Override
        public String getFirstParam(String param) {
            return request.getFirstParam(param);
        }

        @Override
        public String getQueryParamValue(String param) {
            return request.getQueryParamValue(param);
        }

        @Override
        public HttpFacade.Cookie getCookie(String cookieName) {
            return request.getCookie(cookieName);
        }

        @Override
        public String getHeader(String name) {
            return request.getHeader(name);
        }

        @Override
        public List<String> getHeaders(String name) {
            return request.getHeaders(name);
        }

        @Override
        public InputStream getInputStream() {
            return request.getInputStream();
        }

        @Override
        public InputStream getInputStream(boolean buffered) {
            return request.getInputStream(buffered);
        }

        @Override
        public String getRemoteAddr() {
            return request.getRemoteAddr();
        }

        @Override
        public void setError(AuthenticationError error) {
            request.setError(error);
        }

        @Override
        public void setError(LogoutError error) {
            request.setError(error);
        }
    }

    static class ProxiedRequestFacadeWrapper implements HttpFacade {
        final JettyHttpFacade facade;

        public ProxiedRequestFacadeWrapper(JettyHttpFacade facade) {
            this.facade = facade;
        }

        @Override
        public Request getRequest() {
            return new ProxiedRequestWrapper(facade.getRequest());
        }

        @Override
        public Response getResponse() {
            return facade.getResponse();
        }

        @SuppressWarnings("removal")
        @Override
        public X509Certificate[] getCertificateChain() {
            return facade.getCertificateChain();
        }
    }

    SaturnKeycloakJettyAuthenticator(AdapterConfig config) {
        setAdapterConfig(config);
    }

    @Override
    protected JettyRequestAuthenticator createRequestAuthenticator(
            Request request, JettyHttpFacade facade, KeycloakDeployment deployment, AdapterTokenStore tokenStore) {
        return new Jetty94RequestAuthenticator(
                new ProxiedRequestFacadeWrapper(facade), deployment, tokenStore, -1, request) {
            @Override
            public AuthChallenge getChallenge() {
                // No redirects for API requests
                if (request.getHttpURI().asString().startsWith("/api/")) {
                    return new AuthChallenge() {
                        @Override
                        public boolean challenge(HttpFacade exchange) {
                            if (deployment.isEnableBasicAuth()
                                    && exchange.getRequest().getCookie("JSESSIONID") == null
                                    && !exchange.getRequest()
                                            .getHeader("X-Requested-With")
                                            .equals("XMLHttpRequest")) {
                                exchange.getResponse().addHeader("WWW-Authenticate", "Basic");
                            }
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

            @Override
            protected void completeBearerAuthentication(
                    KeycloakPrincipal<RefreshableKeycloakSecurityContext> principal, String method) {
                // Stores the token in the session
                completeOAuthAuthentication(principal);
            }
        };
    }

    @Override
    public void logout(ServletRequest request) {
        logoutCurrent((Request) request);
    }
}
