package nl.fairspace.pluto.auth.filters;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;

import nl.fairspace.pluto.auth.JwtTokenValidator;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.doReturn;

@RunWith(MockitoJUnitRunner.class)
public class HeaderAuthenticationFilterTest {

    private HeaderAuthenticationFilter filter;

    @Mock
    private JwtTokenValidator tokenValidator;

    @Mock
    GatewayFilterChain filterChain;

    Map<String, Object> claims;

    ServerWebExchange exchange;

    @Before
    public void setUp() {
        filter = new HeaderAuthenticationFilter(tokenValidator);
        claims = new HashMap<>();
        claims.put("authorities", Collections.singletonList("test"));
    }

    @Test
    public void testHappyFlow() {
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost")
                .header("Authorization", "Bearer test-token")
                .build();
        exchange = MockServerWebExchange.from(request);

        doReturn(claims).when(tokenValidator).parseAndValidate("test-token");
        filter.filter(exchange, filterChain);

        assertEquals(
                claims,
                ((OAuthAuthenticationToken) exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE))
                        .getClaimsSet());
    }

    @Test
    public void testTokenAlreadyExists() {
        OAuthAuthenticationToken token = new OAuthAuthenticationToken("token", "refresh", "id");
        MockServerHttpRequest request =
                MockServerHttpRequest.get("http://localhost").build();
        exchange = MockServerWebExchange.from(request);
        exchange.getAttributes().put(AUTHORIZATION_REQUEST_ATTRIBUTE, token);
        int originalAttributesSize = exchange.getAttributes().size();

        filter.filter(exchange, filterChain);

        assertEquals(token, exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize, exchange.getAttributes().size());
    }

    @Test
    public void testInvalidToken() {
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost")
                .header("Authorization", "Bearer test-token")
                .build();
        exchange = MockServerWebExchange.from(request);
        doReturn(null).when(tokenValidator).parseAndValidate("test-token");
        int originalAttributesSize = exchange.getAttributes().size();

        filter.filter(exchange, filterChain);

        assertNull(exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize, exchange.getAttributes().size());
    }
}
