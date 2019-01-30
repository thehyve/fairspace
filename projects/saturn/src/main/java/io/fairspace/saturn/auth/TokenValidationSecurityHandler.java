package io.fairspace.saturn.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.RemoteKeySourceException;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.util.security.Constraint;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URL;
import java.text.ParseException;
import java.util.List;
import java.util.Map;

import static com.nimbusds.jose.JWSAlgorithm.RS256;
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toSet;
import static javax.servlet.http.HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

@Slf4j
public class TokenValidationSecurityHandler extends ConstraintSecurityHandler {
    static final String USER_INFO_REQUEST_ATTRIBUTE = UserInfo.class.getName();

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String USERNAME_CLAIM = "preferred_username";
    private static final String FULLNAME_CLAIM = "name";
    private static final String SUBJECT_CLAIM = "sub";
    private static final String AUTHORITIES_CLAIM = "authorities";

    private final DefaultJWTProcessor<?> jwtProcessor;

    TokenValidationSecurityHandler(URL jwksUrl) {
        jwtProcessor = new DefaultJWTProcessor<>() {{
            setJWSKeySelector(new JWSVerificationKeySelector<>(RS256, new RemoteJWKSet<>(jwksUrl)));
            setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>());
        }};
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        var roleInfo = prepareConstraintInfo(pathInContext, baseRequest);

        if (isAuthMandatory(baseRequest, baseRequest.getResponse(), roleInfo)
                && request.getAttribute(USER_INFO_REQUEST_ATTRIBUTE) == null) {
            var authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

            if (authorizationHeader == null) {
                response.sendError(SC_UNAUTHORIZED, "Missing Authorization header");
                baseRequest.setHandled(true);
                return;
            }

            if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
                response.sendError(SC_UNAUTHORIZED, "Unsupported authorization method");
                baseRequest.setHandled(true);
                return;
            }

            var token = authorizationHeader.substring(BEARER_PREFIX.length());
            JWTClaimsSet claimsSet;
            try {
                claimsSet = jwtProcessor.process(token, null);
            } catch (RemoteKeySourceException e) {
                log.error("Error while retrieving remote JWK set", e);
                response.sendError(SC_INTERNAL_SERVER_ERROR, "Couldn't retrieve or parse remote JWK set");
                baseRequest.setHandled(true);
                return;
            } catch (ParseException | BadJOSEException | JOSEException e) {
                log.error("Error while validating token", e);
                response.sendError(SC_UNAUTHORIZED, "Invalid token");
                baseRequest.setHandled(true);
                return;
            }

            var claims = claimsSet.getClaims();

            request.setAttribute(USER_INFO_REQUEST_ATTRIBUTE, createUserInfo(claims));
        }

        super.handle(pathInContext, baseRequest, request, response);
    }

    private static UserInfo createUserInfo(Map<String, Object> claims) {
        return new UserInfo(
                getStringClaim(claims, SUBJECT_CLAIM),
                getStringClaim(claims, USERNAME_CLAIM),
                getStringClaim(claims, FULLNAME_CLAIM),
                ((List<?>) claims.getOrDefault(AUTHORITIES_CLAIM, emptyList()))
                        .stream()
                        .map(Object::toString)
                        .collect(toSet()));
    }

    private static String getStringClaim(Map<String, ?> claims, String key) {
        var value = claims.get(key);
        return (value != null) ? value.toString() : null;
    }

    TokenValidationSecurityHandler addConstraintMapping(String pathSpec, boolean authenticate) {
        addConstraintMapping(new ConstraintMapping() {{
            setPathSpec(pathSpec);
            setConstraint(new Constraint() {{ setAuthenticate(authenticate); }});
        }});
        return this;
    }
}
