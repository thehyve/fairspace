package io.fairspace.saturn;

import io.fairspace.saturn.auth.UserInfo;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Request;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.function.Function;

import static org.junit.Assert.fail;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class SaturnSecurityHandlerTest {
    @Mock
    private Function<HttpServletRequest, UserInfo> authenticator;
    @Mock
    private Request baseRequest;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private Handler nextHandler;

    private SaturnSecurityHandler handler;

    @Before
    public void before() {
        handler = new SaturnSecurityHandler("/api/v1/", ConfigLoader.CONFIG.auth, authenticator);
        handler.setHandler(nextHandler);
    }

    @Test
    public void healthEndpointCanBeAccessedWithoutAuth() throws IOException, ServletException {
        handler.handle("/api/v1/health/", baseRequest, request, response);

        verifyIfRequestWasPassedToNextHandler(true);
    }


    @Test
    public void otherEndpointsCanNotBeAccessedWithoutAuth() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(null);

        handler.handle("/api", baseRequest, request, response);

        verifyAuthenticated(false);
    }

    @Test
    public void sparqlRequiresSparqlRole() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(new UserInfo(null, null, null, null, Set.of("user")));

        handler.handle("/api/v1/rdf/", baseRequest, request, response);

        verifyAuthenticated(false);

        when(authenticator.apply(eq(request))).thenReturn(new UserInfo(null, null, null, null, Set.of("user", "sparql")));

        handler.handle("/api/v1/rdf/", baseRequest, request, response);

        verifyAuthenticated(true);
    }

    @Test
    public void vocabularyCanBeAccessedWithoutAdditionalRoles() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(new UserInfo(null, null, null, null, Set.of("user")));
        when(request.getMethod()).thenReturn("GET");

        handler.handle("/api/v1/vocabulary/", baseRequest, request, response);

        verifyAuthenticated(true);
    }

    @Test
    public void vocabularyEditingRequiresDatastewardRole() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(new UserInfo(null, null, null, null, Set.of("user")));
        when(request.getMethod()).thenReturn("PUT");

        handler.handle("/api/v1/vocabulary/", baseRequest, request, response);

        verifyAuthenticated(false);

        when(authenticator.apply(eq(request))).thenReturn(new UserInfo(null, null, null, null, Set.of("user", "datasteward")));
        when(request.getMethod()).thenReturn("PUT");

        handler.handle("/api/v1/vocabulary/", baseRequest, request, response);

        verifyAuthenticated(true);
    }


    @Test
    public void otherEndpointsCanBeAccessedWithValidAuth() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(new UserInfo(null, null, null, null, Set.of("user")));

        handler.handle("/api/v1/some/", baseRequest, request, response);

        verifyAuthenticated(true);
    }

    private void verifyAuthenticated(boolean success) {
        verifyIfRequestWasPassedToNextHandler(success);
    }

    private void verifyIfRequestWasPassedToNextHandler(boolean success) {
        try {
            verify(nextHandler, times(success ? 1 : 0)).handle(any(), any(), any(), any()); // Called in super.handle
        } catch (Exception e) {
            fail();
        }
    }
}
