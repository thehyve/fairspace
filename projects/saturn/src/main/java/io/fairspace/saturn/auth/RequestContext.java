package io.fairspace.saturn.auth;

import io.fairspace.saturn.rdf.SparqlUtils;
import org.apache.jena.graph.Node;
import org.eclipse.jetty.server.*;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.representations.AccessToken;

import java.security.Principal;
import java.util.Optional;

public class RequestContext {
    private static final ThreadLocal<Request> currentRequest = new ThreadLocal<>();

    public static Request getCurrentRequest() {
        return Optional.ofNullable(HttpConnection.getCurrentConnection())
                .map(HttpConnection::getHttpChannel)
                .map(HttpChannel::getRequest)
                .orElseGet(currentRequest::get);
    }

    public static void setCurrentRequest(Request request) {
        currentRequest.set(request);
    }

    public static UserIdentity getCurrentUser() {
        return Optional.ofNullable(getCurrentRequest())
                .map(Request::getAuthentication)
                .map(x -> (Authentication.User)x)
                .map(Authentication.User::getUserIdentity)
                .orElse(null);
    }

    public static Node getCurrentUserURI() {
        return Optional.ofNullable(getCurrentUser())
                .map(UserIdentity::getUserPrincipal)
                .map(Principal::getName)
                .map(SparqlUtils::generateMetadataIri)
                .orElse(null);
    }

    public static AccessToken getAccessToken() {
        return Optional.ofNullable(getCurrentUser())
                .map(UserIdentity::getUserPrincipal)
                .map(x -> (KeycloakPrincipal<?>)x)
                .map(KeycloakPrincipal::getKeycloakSecurityContext)
                .map(KeycloakSecurityContext::getToken)
                .orElse(null);
    }

    public static boolean isAdmin() {
        return getCurrentUser().isUserInRole("organisation-admin", null);
    }

    public static boolean showDeletedFiles() {
        return "on".equalsIgnoreCase(getCurrentRequest().getHeader("Show-Deleted"));
    }
}
