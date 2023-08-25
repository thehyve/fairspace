package nl.fairspace.pluto.auth.filters;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE;
import static org.junit.Assert.assertEquals;

@RunWith(MockitoJUnitRunner.class)
public class CheckAuthenticationFilterTest {
    CheckAuthenticationFilter filter;

    ServerWebExchange exchange;

    @Mock
    GatewayFilterChain filterChain;

    private boolean isAuthorized = true;

    @Before
    public void setUp() {
        filter = new CheckAuthenticationFilter() {
            @Override
            protected boolean isAuthorized(ServerWebExchange exchange) {
                return isAuthorized;
            }
        };
        isAuthorized = true;
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost").build();
        exchange = MockServerWebExchange.from(request);
    }

    @Test
    public void testFilterStoresAuthorizationResult() {
        int originalAttributesSize = exchange.getAttributes().size();
        filter.filter(exchange, filterChain);

        assertEquals(Boolean.TRUE, exchange.getAttributes().get(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize+1, exchange.getAttributes().size());
    }

    @Test
    public void testFilterStopsOnFailedAuthentication() {
        int originalAttributesSize = exchange.getAttributes().size();
        isAuthorized = false;
        filter.filter(exchange, filterChain);

        assertEquals(originalAttributesSize, exchange.getAttributes().size());
    }

    @Test
    public void testFilterSkipsOnExistingResult() {
        exchange.getAttributes().put(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE, Boolean.TRUE);
        filter = new CheckAuthenticationFilter() {
            @Override
            protected boolean isAuthorized(ServerWebExchange exchange) {
                throw new RuntimeException("this method should not be called");
            }
        };

        filter.filter(exchange, filterChain);
        assertEquals(Boolean.TRUE, exchange.getAttributes().get(AUTHORIZATION_CHECKED_REQUEST_ATTRIBUTE));
    }
}
