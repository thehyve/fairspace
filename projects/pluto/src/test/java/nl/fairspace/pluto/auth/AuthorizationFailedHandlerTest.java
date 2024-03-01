package nl.fairspace.pluto.auth;

import java.time.Duration;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;

import static org.junit.Assert.assertEquals;

@RunWith(MockitoJUnitRunner.class)
public class AuthorizationFailedHandlerTest {
    AuthorizationFailedHandler authorizationFailedHandler;

    ServerWebExchange exchange;

    @Before
    public void setUp() {
        authorizationFailedHandler = new AuthorizationFailedHandler();
    }

    @Test
    public void testRedirect() {
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost")
                .header("Accept", "text/html")
                .build();
        exchange = MockServerWebExchange.from(request);
        authorizationFailedHandler.handleFailedAuthorization(exchange);
        assertEquals(HttpStatusCode.valueOf(302), exchange.getResponse().getStatusCode());
        assertEquals(
                "http://localhost/login",
                exchange.getResponse().getHeaders().get(HttpHeaders.LOCATION).get(0));
    }

    @Test
    public void testRedirectForHtmlAndJson() {
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost")
                .header("Accept", "text/html, application/json, other-types")
                .build();
        exchange = MockServerWebExchange.from(request);
        authorizationFailedHandler.handleFailedAuthorization(exchange);
        assertEquals(HttpStatusCode.valueOf(302), exchange.getResponse().getStatusCode());
        assertEquals(
                "http://localhost/login",
                exchange.getResponse().getHeaders().get(HttpHeaders.LOCATION).get(0));
    }

    @Test
    public void testStorageOfCurrentRequestUri() {
        MockServerHttpRequest request = MockServerHttpRequest.get("http://request-uri")
                .header("Accept", "text/html")
                .build();
        exchange = MockServerWebExchange.from(request);
        authorizationFailedHandler.handleFailedAuthorization(exchange);
        assertEquals(
                "http://request-uri",
                exchange.getSession()
                        .block(Duration.ofMillis(500))
                        .getAttribute(AuthConstants.PREVIOUS_REQUEST_SESSION_ATTRIBUTE));
    }

    @Test
    public void test401ForJsonRequests() {
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost")
                .header("Accept", "application/json")
                .build();
        exchange = MockServerWebExchange.from(request);
        authorizationFailedHandler.handleFailedAuthorization(exchange);
        assertEquals(HttpStatusCode.valueOf(401), exchange.getResponse().getStatusCode());
    }

    @Test
    public void test401ForXHRRequests() {
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost")
                .header("Accept", "X-Requested-With")
                .build();
        exchange = MockServerWebExchange.from(request);
        authorizationFailedHandler.handleFailedAuthorization(exchange);
        assertEquals(HttpStatusCode.valueOf(401), exchange.getResponse().getStatusCode());
    }

    @Test
    public void test401WithoutHeaders() {
        MockServerHttpRequest request =
                MockServerHttpRequest.get("http://localhost").build();
        assertEquals(0, request.getHeaders().size());
        exchange = MockServerWebExchange.from(request);
        authorizationFailedHandler.handleFailedAuthorization(exchange);
        assertEquals(HttpStatusCode.valueOf(401), exchange.getResponse().getStatusCode());
    }
}
