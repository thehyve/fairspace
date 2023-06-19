package nl.fairspace.pluto.auth.filters;

import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class AuthorizedCheckAuthenticationFilterTest {

    AuthorizedCheckAuthenticationFilter filter;
    private final String requiredAuthority = "login";
    private OAuthAuthenticationToken token;
    private Map<String, Object> claims;
    ServerWebExchange exchange;

    @Before
    public void setUp() {
        filter = new AuthorizedCheckAuthenticationFilter(requiredAuthority);
        claims = new HashMap<>();
        token = new OAuthAuthenticationToken("access", "refresh", "id", claims);
        MockServerHttpRequest request = MockServerHttpRequest.get("http://localhost").build();
        exchange = MockServerWebExchange.from(request);
    }

    @Test
    public void testHappyFlow() {
        claims.put(AuthConstants.AUTHORITIES_CLAIM, List.of("test", "other", requiredAuthority));
        exchange.getAttributes().put(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE, token);

        assertTrue(filter.isAuthorized(exchange));
    }

    @Test
    public void testNotAuthorizedWithoutToken() {
        assertNull(exchange.getAttributes().get(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE));
        assertFalse(filter.isAuthorized(exchange));
    }

    @Test
    public void testMultipleValidAuthorities() {
        exchange.getAttributes().put(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE, token);

        String[] authorities = new String[] {"some-authority", "another", "test"};
        filter = new AuthorizedCheckAuthenticationFilter(authorities);

        // The user is authorized with any of the authorities
        Stream.of(authorities)
                .forEach(authority -> {
                    claims.put(AuthConstants.AUTHORITIES_CLAIM, Collections.singletonList(authority));
                    assertTrue(filter.isAuthorized(exchange));
                });

        // The user is not authorized with another authority
        claims.put(AuthConstants.AUTHORITIES_CLAIM, Collections.singletonList("non-authorized"));
        assertFalse(filter.isAuthorized(exchange));
    }

    @Test
    public void testNotAuthorizedWithoutCorrectAuthority() {
        exchange.getAttributes().put(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE, token);
        assertFalse(filter.isAuthorized(exchange));
    }
}
