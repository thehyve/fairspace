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

import static org.junit.jupiter.api.Assertions.assertThrows;
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
        JWTClaimsSetVerifier claimsSetVerifier = getJwtClaimsSetVerifier();
        JWTClaimsSet claimsSet = getJwtClaimsSet(-1);
        assertThrows(BadJWTException.class, () -> claimsSetVerifier.verify(claimsSet, null));
    }

    @Test
    void testExpiryDateInTheFuture() throws MalformedURLException, BadJWTException {
        JWTClaimsSetVerifier claimsSetVerifier = getJwtClaimsSetVerifier();
        JWTClaimsSet claimsSet = getJwtClaimsSet(1);

        claimsSetVerifier.verify(claimsSet, null);
    }

    private JWTClaimsSet getJwtClaimsSet(int addSeconds) {
        Date expiry = Date.from(Instant.now().plus(addSeconds, ChronoUnit.SECONDS));
        return new JWTClaimsSet.Builder()
                .expirationTime(expiry)
                .build();
    }

    private JWTClaimsSetVerifier getJwtClaimsSetVerifier() throws MalformedURLException {
        ConfigurableJWTProcessor jwtProcessor = (ConfigurableJWTProcessor) authBeans.jwtProcessor();
        return jwtProcessor.getJWTClaimsSetVerifier();
    }

}
