package io.fairspace.saturn.auth;

import io.fairspace.oidc_auth.JwtTokenValidator;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import static io.fairspace.oidc_auth.model.OAuthAuthenticationToken.*;
import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;
import static java.util.Arrays.asList;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class SecurityUtilTest {
    @Mock
    private JwtTokenValidator tokenValidator;

    @Mock
    private HttpServletRequest request;

    private Function<HttpServletRequest, OAuthAuthenticationToken> authenticator;

    @Before
    public void before() {
        authenticator = createAuthenticator(tokenValidator);
    }

    @Test
    public void testHappyFlow() throws Exception {
        when(request.getHeader(eq("Authorization"))).thenReturn("Bearer token");
        var claims  = Map.of(
                SUBJECT_CLAIM, "subj",
                FULLNAME_CLAIM, "John Smith",
                USERNAME_CLAIM, "user1",
                EMAIL_CLAIM, "user@example.com",
                AUTHORITIES_CLAIM, asList("role1", "role2"));
        when(tokenValidator.parseAndValidate(eq("token"))).thenReturn(claims);

        var userInfo = authenticator.apply(request);
        assertNotNull(userInfo);
        assertEquals("subj", userInfo.getSubjectClaim());
        assertEquals("John Smith", userInfo.getFullName());
        assertEquals("user1", userInfo.getUsername());
        assertEquals("user@example.com", userInfo.getEmail());
        assertEquals(Set.of("role1", "role2"), userInfo.getAuthorities());
    }

    @Test
    public void testNoAuthHeader() {
        when(request.getHeader(eq("Authorization"))).thenReturn(null);

        assertNull(authenticator.apply(request));
    }

    @Test
    public void testWrongAuthType() {
        when(request.getHeader(eq("Authorization"))).thenReturn("Bear likes beer");

        assertNull(authenticator.apply(request));
    }

    @Test
    public void testWrongToken() throws Exception {
        when(request.getHeader(eq("Authorization"))).thenReturn("Bearer token");
        when(tokenValidator.parseAndValidate(eq("token"))).thenReturn(null);

        assertNull(authenticator.apply(request));
    }
}