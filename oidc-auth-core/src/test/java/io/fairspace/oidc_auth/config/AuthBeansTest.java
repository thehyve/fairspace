package io.fairspace.oidc_auth.config;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.BadJWTException;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.JWTClaimsSetVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.fail;

@ExtendWith(MockitoExtension.class)
public class AuthBeansTest {
    private OidcConfig oidcConfig;
    private AuthBeans authBeans;

    @BeforeEach
    void setUp() throws URISyntaxException {
        oidcConfig = new OidcConfig();
        oidcConfig.setJwkKeySetUri(new URI("http://test.uri"));

        authBeans = new AuthBeans(oidcConfig);
    }

    @Test
    void testExpiryDateInThePast() throws MalformedURLException, BadJWTException {
        ConfigurableJWTProcessor jwtProcessor = (ConfigurableJWTProcessor) authBeans.jwtProcessor();
        JWTClaimsSetVerifier claimsSetVerifier = jwtProcessor.getJWTClaimsSetVerifier();

        Date expiry = Date.from(Instant.now().minus(1, ChronoUnit.SECONDS));
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .expirationTime(expiry)
                .build();

        try {
            claimsSetVerifier.verify(claimsSet, null);
            fail("JWT with expiry in the past should not be verified");
        } catch(BadJWTException e) {

        }
    }

    @Test
    void testExpiryDateInTheFuture() throws MalformedURLException, BadJWTException {
        ConfigurableJWTProcessor jwtProcessor = (ConfigurableJWTProcessor) authBeans.jwtProcessor();
        JWTClaimsSetVerifier claimsSetVerifier = jwtProcessor.getJWTClaimsSetVerifier();

        Date expiry = Date.from(Instant.now().plus(1, ChronoUnit.SECONDS));
        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .expirationTime(expiry)
                .build();

        claimsSetVerifier.verify(claimsSet, null);
    }

}
