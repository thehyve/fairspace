package io.fairspace.oidc_auth.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.*;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;

import javax.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.util.Date;

import static com.nimbusds.jose.JWSAlgorithm.RS256;

@Configuration
@Slf4j
public class AuthBeans {
    private OidcConfig oidcConfig;

    @Autowired
    public AuthBeans(OidcConfig oidcConfig) {
        this.oidcConfig = oidcConfig;
    }

    @Bean
    JWTProcessor accessTokenJwtProcessor() throws MalformedURLException {
        return jwtProcessor(oidcConfig.getAccessTokenJwkAlgorithm());
    }

    @Bean
    JWTProcessor refreshTokenJwtProcessor() throws MalformedURLException {
        return jwtProcessor(oidcConfig.getRefreshTokenJwkAlgorithm());
    }


    @Bean
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
    OAuthAuthenticationToken authenticationToken(HttpServletRequest request) {
        return (OAuthAuthenticationToken) request.getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);
    }

    /**
     * Constructs a JWTProcessor instance to process JWT tokens according to the oidcConfiguration
     * @param expectedJWSAlgorithm The expected JWS algorithm of the access tokens (agreed out-of-band)
     * @return
     * @throws MalformedURLException
     */
    JWTProcessor jwtProcessor(JWSAlgorithm expectedJWSAlgorithm) throws MalformedURLException {
        // Set up a JWT processor to parse the tokens and then check their signature
        // and validity time window (bounded by the "iat", "nbf" and "exp" claims)
        ConfigurableJWTProcessor jwtProcessor = new DefaultJWTProcessor();

        // The public RSA keys to validate the signatures will be sourced from the
        // OAuth 2.0 server's JWK set, published at a well-known URL. The RemoteJWKSet
        // object caches the retrieved keys to speed up subsequent look-ups and can
        // also gracefully handle key-rollover
        log.info("Using remote key set from URL {}", oidcConfig.getJwkKeySetUri().toString());
        JWKSource keySource = new RemoteJWKSet(oidcConfig.getJwkKeySetUri().toURL());

        // Configure the JWT processor with a key selector to feed matching public
        // RSA keys sourced from the JWK set URL
        JWSKeySelector keySelector = new JWSVerificationKeySelector(expectedJWSAlgorithm, keySource);
        jwtProcessor.setJWSKeySelector(keySelector);

        // The overridden version of "verify" allows expiration time to be set to zero (no expiry).
        DefaultJWTClaimsVerifier claimsVerifier = new DefaultJWTClaimsVerifier<SecurityContext>() {
            @Override
            public void verify(JWTClaimsSet claimsSet, SecurityContext context) throws BadJWTException {
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

}
