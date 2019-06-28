package io.fairspace.saturn.auth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jwt.proc.JWTProcessor;

import javax.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.function.Function;

import static io.fairspace.saturn.Context.currentRequest;
import static org.apache.http.HttpHeaders.AUTHORIZATION;

public class SecurityUtil {
    public static Function<HttpServletRequest, UserInfo> createAuthenticator(String jwksUrl, String algorithm) {
        return createAuthenticator(jwksUrl, JWSAlgorithm.parse(algorithm));
    }

    public static Function<HttpServletRequest, UserInfo> createAuthenticator(String jwksUrl, JWSAlgorithm algorithm) {
        return createAuthenticator(new DefaultJWTProcessor<>() {{
            try {
                setJWSKeySelector(new JWSVerificationKeySelector<>(algorithm, new RemoteJWKSet<>(new URL(jwksUrl))));
            } catch (MalformedURLException e) {
                throw new RuntimeException(e);
            }
            setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>());
        }});
    }

    public static Function<HttpServletRequest, UserInfo> createAuthenticator(JWTProcessor<?> jwtProcessor) {
        return new JWTAuthenticator(jwtProcessor)::getUserInfo;
    }

    public static String authorizationHeader() {
        return currentRequest()
                .map(context -> context.getHeader(AUTHORIZATION))
                .orElse(null);
    }
}
