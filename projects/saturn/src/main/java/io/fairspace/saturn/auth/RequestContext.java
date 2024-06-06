package io.fairspace.saturn.auth;

import java.security.Principal;
import java.util.Optional;

import org.apache.jena.graph.Node;
import org.eclipse.jetty.server.*;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.representations.AccessToken;

import io.fairspace.saturn.rdf.SparqlUtils;

public class RequestContext {

    private static final ThreadLocal<Request> currentRequest = new ThreadLocal<>();

    private static final ThreadLocal<String> currentUserUri = new ThreadLocal<>();

    public static Request getCurrentRequest() {
        return Optional.ofNullable(HttpConnection.getCurrentConnection())
                .map(HttpConnection::getHttpChannel)
                .map(HttpChannel::getRequest)
                .orElseGet(currentRequest::get);
    }

    public static void setCurrentRequest(Request request) {
        currentRequest.set(request);
    }

    public static Optional<String> getCurrentUserStringUri() {
        if (currentUserUri.get() == null) {
            var uri = getUserURI();
            setCurrentUserStringUri(uri == null ? null : uri.getURI());
        }
        return Optional.ofNullable(currentUserUri.get());
    }

    public static void setCurrentUserStringUri(String uri) {
        currentUserUri.set(uri);
    }

    private static Optional<UserIdentity> getUserIdentity() {
        return Optional.ofNullable(getCurrentRequest())
                .map(Request::getAuthentication)
                .map(x -> (Authentication.User) x)
                .map(Authentication.User::getUserIdentity);
    }

    private static Optional<Principal> getPrincipal() {
        return getUserIdentity().map(UserIdentity::getUserPrincipal);
    }

    public static Node getUserURI() {
        return getPrincipal()
                .map(Principal::getName)
                .map(SparqlUtils::generateMetadataIri)
                .orElse(null);
    }

    public static AccessToken getAccessToken() {
        return getPrincipal()
                .map(x -> (KeycloakPrincipal<?>) x)
                .map(KeycloakPrincipal::getKeycloakSecurityContext)
                .map(KeycloakSecurityContext::getToken)
                .orElse(null);
    }

    public static String getIdTokenString() {
        return getPrincipal()
                .map(x -> (KeycloakPrincipal<?>) x)
                .map(KeycloakPrincipal::getKeycloakSecurityContext)
                .map(KeycloakSecurityContext::getIdTokenString)
                .orElse(null);
    }
}
