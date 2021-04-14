package nl.fairspace.pluto.auth.filters;

import nl.fairspace.pluto.auth.*;
import nl.fairspace.pluto.auth.model.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.*;
import org.mockito.*;
import org.mockito.junit.jupiter.*;

import javax.servlet.http.*;
import java.util.*;
import java.util.stream.*;

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthorizedCheckAuthenticationFilterTest {

    AuthorizedCheckAuthenticationFilter filter;
    private String requiredAuthority = "login";
    private OAuthAuthenticationToken token;
    private Map<String, Object> claims;

    @Mock
    HttpServletRequest request;

    @BeforeEach
    void setUp() {
        filter = new AuthorizedCheckAuthenticationFilter(requiredAuthority);
        claims = new HashMap<>();
        token = new OAuthAuthenticationToken("access", "refresh", claims);
    }

    @Test
    void testHappyFlow() {
        claims.put(AuthConstants.AUTHORITIES_CLAIM, List.of("test", "other", requiredAuthority));
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertTrue(filter.isAuthorized(request));
    }

    @Test
    void testNotAuthorizedWithoutToken() {
        doReturn(null).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);

        assertFalse(filter.isAuthorized(request));
    }

    @Test
    void testMultipleValidAuthorities() {
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
    void testNotAuthorizedWithoutCorrectAuthority() {
        doReturn(token).when(request).getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);
        assertFalse(filter.isAuthorized(request));
    }
}
