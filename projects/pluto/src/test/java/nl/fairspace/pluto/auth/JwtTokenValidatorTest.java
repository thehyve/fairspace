package nl.fairspace.pluto.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.JWTProcessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.text.ParseException;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

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
