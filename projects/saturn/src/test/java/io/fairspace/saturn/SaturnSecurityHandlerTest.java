package io.fairspace.saturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.fairspace.saturn.auth.UserInfo;
import org.eclipse.jetty.http.MimeTypes;
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
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
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

    private StringWriter writer;

    private SaturnSecurityHandler handler;

    @Before
    public void before() throws IOException {
        handler = new SaturnSecurityHandler("/api/v1", ConfigLoader.CONFIG.auth, authenticator);
        handler.setHandler(nextHandler);

        writer = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(writer));
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

    @Test
    public void errorMessageIsSentCorrectly() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(null);

        handler.handle("/api", baseRequest, request, response);

        verifyAuthenticated(false);

        // Verify the response
        verify(response).setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        verify(response).setContentType(MimeTypes.Type.APPLICATION_JSON.toString());

        ObjectMapper mapper = new ObjectMapper();
        Map errorBody = mapper.readValue(writer.toString(), Map.class);
        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, errorBody.get("status"));
        assertNotNull(errorBody.get("message"));
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
