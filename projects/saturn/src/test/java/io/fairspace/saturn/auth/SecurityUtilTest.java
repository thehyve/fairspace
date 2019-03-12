package io.fairspace.saturn.auth;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.JWTProcessor;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.HashSet;
import java.util.function.Function;

import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;
import static java.util.Arrays.asList;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class SecurityUtilTest {
    @Mock
    private JWTProcessor<?> jwtProcessor;

    @Mock
    private HttpServletRequest request;

    private Function<HttpServletRequest, UserInfo> authenticator;

    @Before
    public void before() {
        authenticator = createAuthenticator(jwtProcessor);
    }

    @Test
    public void testHappyFlow() throws Exception {
        when(request.getHeader(eq("Authorization"))).thenReturn("Bearer token");
        var claimSet  = new JWTClaimsSet.Builder()
                .subject("subj")
                .claim("name", "John Smith")
                .claim("preferred_username", "user1")
                .claim("email", "user@example.com")
                .claim("authorities", asList("role1", "role2"))
                .build();
        when(jwtProcessor.process(eq("token"), any())).thenReturn(claimSet);

        var userInfo = authenticator.apply(request);
        assertNotNull(userInfo);
        assertEquals("subj", userInfo.getUserId());
        assertEquals("John Smith", userInfo.getFullName());
        assertEquals("user1", userInfo.getUserName());
        assertEquals("user@example.com", userInfo.getEmail());
        assertEquals(new HashSet<>(asList("role1", "role2")), userInfo.getAuthorities());
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
        when(jwtProcessor.process(eq("token"), any())).thenThrow(ParseException.class);

        assertNull(authenticator.apply(request));
    }
}