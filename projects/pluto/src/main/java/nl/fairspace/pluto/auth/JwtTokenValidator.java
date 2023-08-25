package nl.fairspace.pluto.auth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.KeySourceException;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.*;
import lombok.extern.slf4j.Slf4j;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.Map;

@Slf4j
public class JwtTokenValidator {
    private final JWTProcessor<?> jwtProcessor;

    public static JwtTokenValidator create(String jwkSetUrl, String expectedJWSAlgorithm) {
        try {
            return create(new URL(jwkSetUrl), JWSAlgorithm.parse(expectedJWSAlgorithm));
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
    }

    public static JwtTokenValidator create(URL jwkSetUrl, JWSAlgorithm expectedJWSAlgorithm) {
        return  new JwtTokenValidator(jwtProcessor(expectedJWSAlgorithm, jwkSetUrl));
    }

    /**
     * Constructs a JWTProcessor instance to process JWT tokens according to the oidcConfiguration
     * @param expectedJWSAlgorithm The expected JWS algorithm of the access tokens (agreed out-of-band)
     * @return
     */
    private static <C extends SecurityContext> JWTProcessor<C> jwtProcessor(JWSAlgorithm expectedJWSAlgorithm, URL jwkSetUrl) {
        // Set up a JWT processor to parse the tokens and then check their signature
        // and validity time window (bounded by the "iat", "nbf" and "exp" claims)
        ConfigurableJWTProcessor<C> jwtProcessor = new DefaultJWTProcessor<C>();

        // The public RSA keys to validate the signatures will be sourced from the
        // OAuth 2.0 server's JWK set, published at a well-known URL. The RemoteJWKSet
        // object caches the retrieved keys to speed up subsequent look-ups and can
        // also gracefully handle key-rollover
        log.info("Using remote key set from URL {}", jwkSetUrl);
        JWKSource<C> keySource = new RemoteJWKSet<>(jwkSetUrl);

        // Configure the JWT processor with a key selector to feed matching public
        // RSA keys sourced from the JWK set URL
        JWSKeySelector<C> keySelector = new JWSVerificationKeySelector<>(expectedJWSAlgorithm, keySource);
        jwtProcessor.setJWSKeySelector(keySelector);

        // The overridden version of "verify" allows expiration time to be set to zero (no expiry).
        DefaultJWTClaimsVerifier<C> claimsVerifier = new DefaultJWTClaimsVerifier<>(null, null) {
            @Override
            public void verify(JWTClaimsSet claimsSet, C context) throws BadJWTException {
                Date exp = claimsSet.getExpirationTime();

                if (exp != null && exp.getTime() == 0L) {
                    return;
                }

                super.verify(claimsSet, context);
            }
        };

        // Configure the ClaimsSetVerifier not to use any clock skew
        // because the clocks within a cluster are more or less synchronized and
        // the tokens can be refreshed easily
        claimsVerifier.setMaxClockSkew(0);
        jwtProcessor.setJWTClaimsSetVerifier(claimsVerifier);

        return jwtProcessor;
    }

    JwtTokenValidator(JWTProcessor<?> jwtProcessor) {
        this.jwtProcessor = jwtProcessor;
    }

    public Map<String, Object> parseAndValidate(String token) {
        if(token == null || token.isEmpty()) {
            log.debug("Token provided for validation is empty");
            return null;
        }

        // Process the token
        try {
            JWTClaimsSet claimsSet = jwtProcessor.process(token, null);

            if(claimsSet != null) {
                return claimsSet.getClaims();
            } else {
                log.warn("Provided JWT is valid and could be parsed, but does not result in a claimsset");
                return null;
            }
        } catch (KeySourceException e) {
            log.warn("Exception while retrieving keys for JWT validation: {}", e.getMessage() );
            return null;
        } catch (Exception e) {
            log.warn("Provided JWT is invalid or not secured: {}", e.getMessage() );
            log.debug("Stacktrace", e);
            return null;
        }
    }

    public JWTProcessor<?> getJwtProcessor() {
        return jwtProcessor;
    }
}
