package nl.fairspace.pluto.auth.filters;

import com.nimbusds.oauth2.sdk.ParseException;
import nl.fairspace.pluto.auth.JwtTokenValidator;
import nl.fairspace.pluto.auth.OAuthFlow;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;

import java.io.IOException;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE;
import static nl.fairspace.pluto.auth.AuthConstants.AUTHORIZATION_SESSION_ATTRIBUTE;
import static org.junit.Assert.*;
import static org.mockito.Mockito.doReturn;

@RunWith(MockitoJUnitRunner.class)
public class SessionAuthenticationFilterTest {

    private SessionAuthenticationFilter filter;

    @Mock
    private JwtTokenValidator accessTokenValidator;

    @Mock
    private OAuthFlow oAuthFlow;

    @Mock
    GatewayFilterChain filterChain;

    Map<String,Object> claims;
    OAuthAuthenticationToken token = new OAuthAuthenticationToken("test-token", "refresh-token", "id-token");
    OAuthAuthenticationToken tokenWithClaims;
    OAuthAuthenticationToken refreshedToken = new OAuthAuthenticationToken("refreshed-test-token", "refreshed-refresh-token", "refreshed-id-token");
    OAuthAuthenticationToken tokenWithoutRefreshToken = new OAuthAuthenticationToken("test-token", (String) null, "id-token");

    ServerWebExchange exchange;

    @Before
    public void setUp() {
        filter = new SessionAuthenticationFilter(accessTokenValidator, oAuthFlow);
        claims = new HashMap<>();
        claims.put("authorities", Collections.singletonList("test"));
        tokenWithClaims = token.toBuilder().claimsSet(claims).build();
        exchange = MockServerWebExchange.builder(MockServerHttpRequest.get("/")).build();
    }

    @Test
    public void testHappyFlow() {
        WebSession session = this.exchange.getSession().block(Duration.ofMillis(500));
        assertNotNull(session);
        session.getAttributes().put(AUTHORIZATION_SESSION_ATTRIBUTE, token);
        doReturn(claims).when(accessTokenValidator).parseAndValidate("test-token");
        filter.filter(exchange, filterChain);

        assertEquals(tokenWithClaims, exchange.getAttribute(AUTHORIZATION_REQUEST_ATTRIBUTE));
    }

    @Test
    public void testTokenAlreadyExists() {
        OAuthAuthenticationToken token = new OAuthAuthenticationToken("token", "refresh", "id-token");
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost").build();
        exchange = MockServerWebExchange.from(request);
        exchange.getAttributes().put(
                AUTHORIZATION_REQUEST_ATTRIBUTE,
                token
        );

        int originalAttributesSize = exchange.getAttributes().size();

        filter.filter(exchange, filterChain);

        assertEquals(token, exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize, exchange.getAttributes().size());
    }

    @Test
    public void testNoTokenInSession() {
        WebSession session = this.exchange.getSession().block(Duration.ofMillis(500));
        assertNotNull(session);
        int originalAttributesSize = exchange.getAttributes().size();

        filter.filter(exchange, filterChain);

        assertNull(exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize, exchange.getAttributes().size());
    }

    @Test
    public void testInvalidRefreshToken() {
        WebSession session = this.exchange.getSession().block(Duration.ofMillis(500));
        assertNotNull(session);
        session.getAttributes().put(AUTHORIZATION_SESSION_ATTRIBUTE, tokenWithoutRefreshToken);
        doReturn(null).when(accessTokenValidator).parseAndValidate("test-token");
        int originalAttributesSize = exchange.getAttributes().size();

        filter.filter(exchange, filterChain);

        assertNull(exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize, exchange.getAttributes().size());
    }

    @Test
    public void testValidRefreshToken() throws IOException, ParseException {
        WebSession session = this.exchange.getSession().block(Duration.ofMillis(500));
        assertNotNull(session);
        session.getAttributes().put(AUTHORIZATION_SESSION_ATTRIBUTE, token);
        doReturn(null).when(accessTokenValidator).parseAndValidate("test-token");
        doReturn(claims).when(accessTokenValidator).parseAndValidate("refreshed-test-token");
        doReturn(refreshedToken).when(oAuthFlow).refreshToken(token);
        int originalAttributesSize = exchange.getAttributes().size();

        filter.filter(exchange, filterChain);

        OAuthAuthenticationToken finalToken = refreshedToken.toBuilder().claimsSet(claims).build();

        assertEquals(finalToken, exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize + 1, exchange.getAttributes().size());
        assertEquals(finalToken, exchange.getSession().block(Duration.ofMillis(500)).getAttributes().get(AUTHORIZATION_SESSION_ATTRIBUTE));
    }

    @Test
    public void testRefreshingFailed() throws IOException, ParseException {
        WebSession session = this.exchange.getSession().block(Duration.ofMillis(500));
        assertNotNull(session);
        session.getAttributes().put(AUTHORIZATION_SESSION_ATTRIBUTE, token);
        doReturn(null).when(accessTokenValidator).parseAndValidate("test-token");
        doReturn(refreshedToken).when(oAuthFlow).refreshToken(token);
        doReturn(null).when(accessTokenValidator).parseAndValidate("refreshed-test-token");
        int originalAttributesSize = exchange.getAttributes().size();

        filter.filter(exchange, filterChain);

        assertNull(exchange.getAttributes().get(AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertEquals(originalAttributesSize, exchange.getAttributes().size());
    }
}
