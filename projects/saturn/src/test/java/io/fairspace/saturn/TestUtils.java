package io.fairspace.saturn;

import io.fairspace.saturn.auth.RequestContext;
import io.fairspace.saturn.config.ViewsConfig;
import io.fairspace.saturn.rdf.SparqlUtils;
import io.fairspace.saturn.services.users.User;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.jena.rdf.model.Model;
import org.jetbrains.annotations.NotNull;
import org.mockito.Mockito;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.io.File;
import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;

import static java.time.Instant.now;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class TestUtils {

    public static final String ADMIN = "admin";

    public static final String USER = "user";

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

    public static void mockAuthentication(String username) {
        // this is a trick for tests to pass security context to other threads
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
        // Create a mock SecurityContext
        var mockSecurityContext = Mockito.mock(SecurityContext.class);

        // Create a mock Authentication object
        var mockAuthentication = Mockito.mock(Authentication.class);

        // Set the mocked authentication into the security context
        lenient().when(mockSecurityContext.getAuthentication()).thenReturn(mockAuthentication);

        Jwt mockJwt = getMockedJwt(username);
        lenient().when(mockAuthentication.getPrincipal()).thenReturn(mockJwt);
        // Set the mocked SecurityContext in the SecurityContextHolder
        SecurityContextHolder.setContext(mockSecurityContext);
    }

    public static User createTestUser(String username, boolean isAdmin) {
        User user = new User();
        user.setId(username);
        user.setUsername(username);
        user.setName(username);
        user.setIri(SparqlUtils.generateMetadataIriFromId(username));
        user.setAdmin(isAdmin);
        return user;
    }

    // todo: implement this method with Spring Security
    public static void setupRequestContext(final String username) {
        var request = mock(HttpServletRequest.class);
        RequestContext.setCurrentRequest(request);
        RequestContext.setCurrentUserStringUri(SparqlUtils.generateMetadataIriFromId(username).getURI());
        // this is a trick for tests to pass security context to other threads
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
        // Create a mock SecurityContext
        var mockSecurityContext = Mockito.mock(SecurityContext.class);

        // Create a mock Authentication object
        var mockAuthentication = Mockito.mock(Authentication.class);

        // Set the mocked authentication into the security context
        lenient().when(mockSecurityContext.getAuthentication()).thenReturn(mockAuthentication);

        Jwt mockJwt = getMockedJwt(username);
        lenient().when(mockAuthentication.getPrincipal()).thenReturn(mockJwt);
        // Set the mocked SecurityContext in the SecurityContextHolder
        SecurityContextHolder.setContext(mockSecurityContext);
    }

    private static @NotNull Jwt getMockedJwt(String username) {
        var claims = new HashMap<String, Object>();
        claims.put("preferred_username", "fullname");
        claims.put("sub", username);
        claims.put("email", "johndoe@example.com");
        claims.put("name", "fullname");
        return Jwt.withTokenValue("mock-token")
                .header("alg", "RS256")
                .claim("preferred_username", claims.get("preferred_username"))
                .claim("sub", claims.get("sub"))
                .claim("email", claims.get("email"))
                .claim("name", claims.get("name"))
                .build();
    }

    public static void setupRequestContext() {
        setupRequestContext("user");
    }

    public static void selectRegularUser() {
        mockAuthentication(USER);
//        setupRequestContext(USER);
    }

    public static void selectAdmin() {
        mockAuthentication(ADMIN);
//        setupRequestContext(ADMIN);
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
