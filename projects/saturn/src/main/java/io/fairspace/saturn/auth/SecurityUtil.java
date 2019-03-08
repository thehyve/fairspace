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
import static java.util.Collections.singleton;

public class SecurityUtil {
    static final String USER_INFO_REQUEST_ATTRIBUTE = UserInfo.class.getName();
    private static final UserInfo DUMMY_USER = new UserInfo("123", "test-dummy", "John", "user@example.com", singleton("for-local-development-only"));

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

    public static UserInfo userInfo() {
        return currentRequest()
                .map(request -> (UserInfo) request.getAttribute(USER_INFO_REQUEST_ATTRIBUTE))
                .orElse(DUMMY_USER) ;
    }
}
