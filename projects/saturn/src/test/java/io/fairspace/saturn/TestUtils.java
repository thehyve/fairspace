package io.fairspace.saturn;

import java.io.File;
import java.io.IOException;
import java.time.Instant;

import org.apache.jena.rdf.model.Model;
import org.eclipse.jetty.server.Request;

import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.rdf.SparqlUtils;
import io.fairspace.saturn.services.users.User;

import static java.time.Instant.now;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;

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

    //    public static Authentication.User mockAuthentication(String username) {
    //        var auth = mock(Authentication.User.class);
    //        var identity = mock(UserIdentity.class, withSettings().lenient());
    //        when(auth.getUserIdentity()).thenReturn(identity);
    //        var principal = mock(KeycloakPrincipal.class, withSettings().lenient());
    //        when(identity.getUserPrincipal()).thenReturn(principal);
    //        when(principal.getName()).thenReturn(username);
    //        var context = mock(KeycloakSecurityContext.class, withSettings().lenient());
    //        when(principal.getKeycloakSecurityContext()).thenReturn(context);
    //        var token = mock(AccessToken.class, withSettings().lenient());
    //        when(context.getToken()).thenReturn(token);
    //        when(token.getSubject()).thenReturn(username);
    //        when(token.getName()).thenReturn("fullname");
    //        return auth;
    //    }

    public static User createTestUser(String username, boolean isAdmin) {
        User user = new User();
        user.setId(username);
        user.setUsername(username);
        user.setName(username);
        user.setIri(SparqlUtils.generateMetadataIri(username));
        user.setAdmin(isAdmin);
        return user;
    }
    // todo: implement this method with Spring Security
    public static void setupRequestContext() {
        var request = mock(Request.class);
        //        setCurrentRequest(request);
        //        var auth = mockAuthentication("userid");
        //        when(request.getAuthentication()).thenReturn(auth);
    }

    public static ViewsConfig loadViewsConfig(String path) {
        var settingsFile = new File(path);
        if (settingsFile.exists()) {
            try {
                return ViewsConfig.MAPPER.readValue(settingsFile, ViewsConfig.class);
            } catch (IOException e) {
                throw new RuntimeException("Error loading search configuration", e);
            }
        }
        return new ViewsConfig();
    }
}
