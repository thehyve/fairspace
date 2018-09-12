package io.fairspace.oidc_auth.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jwt.proc.JWTProcessor;
import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;

import javax.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;

import static com.nimbusds.jose.JWSAlgorithm.RS256;

@Configuration
@Slf4j
public class AuthBeans {
    @Autowired
    private SecurityConfig securityConfig;

    @Bean
    JWTProcessor jwtProcessor() throws MalformedURLException {
        // Set up a JWT processor to parse the tokens and then check their signature
        // and validity time window (bounded by the "iat", "nbf" and "exp" claims)
        ConfigurableJWTProcessor jwtProcessor = new DefaultJWTProcessor();

        // The public RSA keys to validate the signatures will be sourced from the
        // OAuth 2.0 server's JWK set, published at a well-known URL. The RemoteJWKSet
        // object caches the retrieved keys to speed up subsequent look-ups and can
        // also gracefully handle key-rollover
        JWKSource keySource = new RemoteJWKSet(securityConfig.getOauth2().getJwkKeySetUri().toURL());

        // The expected JWS algorithm of the access tokens (agreed out-of-band)
        JWSAlgorithm expectedJWSAlg = RS256;

        // Configure the JWT processor with a key selector to feed matching public
        // RSA keys sourced from the JWK set URL
        JWSKeySelector keySelector = new JWSVerificationKeySelector(expectedJWSAlg, keySource);
        jwtProcessor.setJWSKeySelector(keySelector);

        return jwtProcessor;
    }

    @Bean
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
    OAuthAuthenticationToken authenticationToken(HttpServletRequest request) {
        return (OAuthAuthenticationToken) request.getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);
    }
}
