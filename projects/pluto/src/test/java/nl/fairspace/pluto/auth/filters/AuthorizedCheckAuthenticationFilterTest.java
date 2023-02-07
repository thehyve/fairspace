package nl.fairspace.pluto.auth.filters;

import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.doReturn;

@RunWith(MockitoJUnitRunner.class)
public class AuthorizedCheckAuthenticationFilterTest {

    AuthorizedCheckAuthenticationFilter filter;
    private String requiredAuthority = "login";
    private OAuthAuthenticationToken token;
    private Map<String, Object> claims;

    @Mock
    HttpServletRequest request;

    @Before
    public void setUp() {
        filter = new AuthorizedCheckAuthenticationFilter(requiredAuthority);
        claims = new HashMap<>();
        token = new OAuthAuthenticationToken("access", "refresh", claims);
    }

    @Test
    public void testHappyFlow() {
        claims.put(AuthConstants.AUTHORITIES_CLAIM, List.of("test", "other", requiredAuthority));
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertTrue(filter.isAuthorized(request));
    }

    @Test
    public void testNotAuthorizedWithoutToken() {
        doReturn(null).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertFalse(filter.isAuthorized(request));
    }

    @Test
    public void testMultipleValidAuthorities() {
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        String[] authorities = new String[] {"some-authority", "another", "test"};
        filter = new AuthorizedCheckAuthenticationFilter(authorities);

        // The user is authorized with any of the authorities
        Stream.of(authorities)
                .forEach(authority -> {
                    claims.put(AuthConstants.AUTHORITIES_CLAIM, Collections.singletonList(authority));
                    assertTrue(filter.isAuthorized(request));
                });

        // The user is not authorized with another authority
        claims.put(AuthConstants.AUTHORITIES_CLAIM, Collections.singletonList("non-authorized"));
        assertFalse(filter.isAuthorized(request));
    }

    @Test
    public void testNotAuthorizedWithoutCorrectAuthority() {
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);
        assertFalse(filter.isAuthorized(request));
    }
}
