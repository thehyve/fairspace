package io.fairspace.saturn.auth;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jwt.proc.JWTProcessor;

import javax.servlet.http.HttpServletRequest;
import java.net.URL;
import java.util.function.Function;

import static io.fairspace.Context.currentRequest;

public class Security {
    static final String USER_INFO_REQUEST_ATTRIBUTE = UserInfo.class.getName();

    public static Function<HttpServletRequest, UserInfo> createAuthenticator(URL jwksUrl, String algorithm) {
        return createAuthenticator(jwksUrl, JWSAlgorithm.parse(algorithm));
    }

    public static Function<HttpServletRequest, UserInfo> createAuthenticator(URL jwksUrl, JWSAlgorithm algorithm) {
        return createAuthenticator(new DefaultJWTProcessor<>() {{
            setJWSKeySelector(new JWSVerificationKeySelector<>(algorithm, new RemoteJWKSet<>(jwksUrl)));
            setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>());
        }});
    }

    public static Function<HttpServletRequest, UserInfo> createAuthenticator(JWTProcessor<?> jwtProcessor) {
        return new JWTAuthenticator(jwtProcessor);
    }

    public static UserInfo userInfo() {
        return (UserInfo) currentRequest()
                .map(request -> request.getAttribute(USER_INFO_REQUEST_ATTRIBUTE))
                .orElse(null) ;
    }
}
