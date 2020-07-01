package io.fairspace.saturn;

import org.apache.jena.rdf.model.Model;
import org.eclipse.jetty.server.Authentication;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.UserIdentity;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.keycloak.representations.AccessToken;

import java.time.Instant;

import static io.fairspace.saturn.auth.RequestContext.setCurrentRequest;
import static java.time.Instant.now;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

public class TestUtils {
    public static void ensureRecentInstant(Instant instant) {
        assertNotNull(instant);
        assertTrue(instant.isAfter(now().minusSeconds(1)));
        assertTrue(now().equals(instant) || instant.isBefore(now()));
    }

    public static Model isomorphic(Model m) {
        return argThat(m::isIsomorphicWith);
    }

    public static Model contains(Model m) {
        return argThat(a -> a.containsAll(m));
    }

    public static void setupRequestContext() {
        var request = mock(Request.class);
        setCurrentRequest(request);
        var auth = mock(Authentication.User.class);
        when(request.getAuthentication()).thenReturn(auth);
        var identity = mock(UserIdentity.class);
        when(auth.getUserIdentity()).thenReturn(identity);
        var principal = mock(KeycloakPrincipal.class, withSettings().lenient());
        when(identity.getUserPrincipal()).thenReturn(principal);
        when(principal.getName()).thenReturn("userid");
        var context = mock(KeycloakSecurityContext.class, withSettings().lenient());
        when(principal.getKeycloakSecurityContext()).thenReturn(context);
        var token = mock(AccessToken.class, withSettings().lenient());
        when(context.getToken()).thenReturn(token);
        when(token.getSubject()).thenReturn("userid");
        when(token.getName()).thenReturn("fullname");
    }
}
