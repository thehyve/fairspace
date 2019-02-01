package io.fairspace.saturn.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.JWTProcessor;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.List;
import java.util.Map;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toSet;

@Slf4j
class JWTAuthenticator {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String USERNAME_CLAIM = "preferred_username";
    private static final String FULLNAME_CLAIM = "name";
    private static final String SUBJECT_CLAIM = "sub";
    private static final String AUTHORITIES_CLAIM = "authorities";

    private final JWTProcessor<?> jwtProcessor;

    JWTAuthenticator(JWTProcessor<?> jwtProcessor) {
        this.jwtProcessor = jwtProcessor;
    }

    public UserInfo getUserInfo(HttpServletRequest request) {
        var storedUserInfo = (UserInfo) request.getAttribute(SecurityUtil.USER_INFO_REQUEST_ATTRIBUTE);
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

        request.setAttribute(SecurityUtil.USER_INFO_REQUEST_ATTRIBUTE, userInfo);
        return userInfo;
    }

    private static String getStringClaim(Map<String, ?> claims, String key) {
        var value = claims.get(key);
        return (value != null) ? value.toString() : null;
    }
}
