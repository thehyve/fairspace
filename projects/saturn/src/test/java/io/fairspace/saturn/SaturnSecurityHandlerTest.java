package io.fairspace.saturn;

import io.fairspace.saturn.auth.UserInfo;
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
import java.util.function.Consumer;
import java.util.function.Function;

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
    private Consumer<UserInfo> userCallback;

    private SaturnSecurityHandler handler;

    @Before
    public void before() {
        handler = new SaturnSecurityHandler(authenticator, userCallback);
    }

    @Test
    public void healthEndpointCanBeAccessedWithoutAuth() throws IOException, ServletException {
        handler.handle("/api/health/", baseRequest, request, response);

        verifyIfRequestWasPassedToSuper(true);
    }


    @Test
    public void otherEndpointsCanNotBeAccessedWithoutAuth() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(null);

        handler.handle("/api", baseRequest, request, response);

        verifyAuthenticated(false);
    }

    @Test
    public void otherEndpointsCanBeAccessedWithValidAuth() throws IOException, ServletException {
        when(authenticator.apply(eq(request))).thenReturn(new UserInfo(null, null, null, null, null));

        handler.handle("/api", baseRequest, request, response);

        verifyAuthenticated(true);
    }

    private void verifyAuthenticated(boolean success) {
        verifyIfRequestWasPassedToSuper(success);
        verify(userCallback, times(success ? 1 : 0)).accept(any());
    }

    private void verifyIfRequestWasPassedToSuper(boolean success) {
        verify(baseRequest, times(success ? 1 : 0)).getResponse(); // Called in super.handle
    }
}