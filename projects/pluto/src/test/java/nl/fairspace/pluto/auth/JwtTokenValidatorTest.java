package nl.fairspace.pluto.auth;

import com.nimbusds.jose.*;
import com.nimbusds.jose.proc.*;
import com.nimbusds.jwt.*;
import com.nimbusds.jwt.proc.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.*;
import org.mockito.*;
import org.mockito.junit.jupiter.*;

import java.text.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class JwtTokenValidatorTest {
    @Mock
    JWTProcessor<?> jwtProcessor;

    String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    Map<String, Object> claims = new HashMap<>();

    JwtTokenValidator tokenValidator;

    @BeforeEach
    void setUp() {
        tokenValidator = new JwtTokenValidator(jwtProcessor);

        claims.put("firstclaim", "value");
    }

    @Test
    void testTokenValidationReturnsClaims() throws ParseException, JOSEException, BadJOSEException {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder().claim("firstclaim", "value").build();
        when(jwtProcessor.process(eq(token), any())).thenReturn(claimsSet);

        Map<String, Object> returnedClaims = tokenValidator.parseAndValidate(token);

        assertEquals(claims, returnedClaims);
    }

    @Test
    void testTokenValidationReturnsNullOnException() throws ParseException, JOSEException, BadJOSEException {
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder().claim("firstclaim", "value").build();
        when(jwtProcessor.process(eq(token), any())).thenThrow(new RuntimeException("Test"));

        Map<String, Object> returnedClaims = tokenValidator.parseAndValidate(token);

        assertNull(returnedClaims);
    }
}
