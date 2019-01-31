package io.fairspace.saturn.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.nimbusds.jwt.proc.JWTProcessor;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.net.URL;
import java.text.ParseException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import static com.nimbusds.jose.JWSAlgorithm.RS256;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toSet;
import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

@Slf4j
public class Security {
    private static final String USER_INFO_REQUEST_ATTRIBUTE = UserInfo.class.getName();
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String USERNAME_CLAIM = "preferred_username";
    private static final String FULLNAME_CLAIM = "name";
    private static final String SUBJECT_CLAIM = "sub";
    private static final String AUTHORITIES_CLAIM = "authorities";

    public static Function<HttpServletRequest, UserInfo> createAuthenticator(URL jwksUrl) {
        return createAuthenticator(new DefaultJWTProcessor<>() {{
            setJWSKeySelector(new JWSVerificationKeySelector<>(RS256, new RemoteJWKSet<>(jwksUrl)));
            setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>());
        }});
    }

    public static Function<HttpServletRequest, UserInfo> createAuthenticator(JWTProcessor<?> jwtProcessor) {
        return request -> {
            var storedUserInfo = (UserInfo) request.getAttribute(USER_INFO_REQUEST_ATTRIBUTE);
            if (storedUserInfo != null) {
                return storedUserInfo;
            }

            var authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

            if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
                return null;
            }

            var token = authorizationHeader.substring(BEARER_PREFIX.length());
            JWTClaimsSet claimsSet;
            try {
                claimsSet = jwtProcessor.process(token, null);
            } catch (ParseException | BadJOSEException | JOSEException e) {
                log.error("Error validating token", e);
                return null;
            }

            var claims = claimsSet.getClaims();

            var userInfo = new UserInfo(
                    getStringClaim(claims, SUBJECT_CLAIM),
                    getStringClaim(claims, USERNAME_CLAIM),
                    getStringClaim(claims, FULLNAME_CLAIM),
                    ((List<?>) claims.getOrDefault(AUTHORITIES_CLAIM, emptyList()))
                            .stream()
                            .map(Object::toString)
                            .collect(toSet()));

            request.setAttribute(USER_INFO_REQUEST_ATTRIBUTE, userInfo);
            return userInfo;
        };
    }

    public static UserInfo userInfo() {
        var connection = getCurrentConnection();
        if (connection == null) {
            return null;
        }
        var request = connection.getHttpChannel().getRequest();
        if (request == null) {
            return null;
        }

        return (UserInfo) request.getAttribute(USER_INFO_REQUEST_ATTRIBUTE);
    }

    private static String getStringClaim(Map<String, ?> claims, String key) {
        var value = claims.get(key);
        return (value != null) ? value.toString() : null;
    }
}
