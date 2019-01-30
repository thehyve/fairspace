package io.fairspace.saturn.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.BadJOSEException;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.*;
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
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

@Slf4j
class BearerAuthenticationFilter implements Filter {
    static final String USER_INFO_REQUEST_ATTRIBUTE = UserInfo.class.getName();

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final String USERNAME_CLAIM = "preferred_username";
    private static final String FULLNAME_CLAIM = "name";
    private static final String SUBJECT_CLAIM = "sub";
    private static final String AUTHORITIES_CLAIM = "authorities";

    private final DefaultJWTProcessor<?> jwtProcessor;

    BearerAuthenticationFilter(URL jwksUrl) {
        jwtProcessor = new DefaultJWTProcessor<>() {{
            setJWSKeySelector(new JWSVerificationKeySelector<>(RS256, new RemoteJWKSet<>(jwksUrl)));
            setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>());
        }};
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        var httpRequest = (HttpServletRequest) request;
        var httpResponse = (HttpServletResponse) response;

        if (httpRequest.getAttribute(USER_INFO_REQUEST_ATTRIBUTE) == null) {
            var authorizationHeader = httpRequest.getHeader(AUTHORIZATION_HEADER);

            if (authorizationHeader == null) {
                httpResponse.sendError(SC_UNAUTHORIZED, "Missing Authorization header");
                return;
            }

            if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
                httpResponse.sendError(SC_UNAUTHORIZED, "Unsupported authorization method");
                return;
            }

            var token = authorizationHeader.substring(BEARER_PREFIX.length());
            JWTClaimsSet claimsSet;
            try {
                claimsSet = jwtProcessor.process(token, null);
            } catch (ParseException | BadJOSEException | JOSEException e) {
                log.error("Error validating token", e);
                httpResponse.sendError(SC_UNAUTHORIZED, "Invalid token");
                return;
            }

            var claims = claimsSet.getClaims();

            var userInfo = new UserInfo(
                    getStringClaim(claims, SUBJECT_CLAIM),
                    getStringClaim(claims, USERNAME_CLAIM),
                    getStringClaim(claims, FULLNAME_CLAIM),
                    ((List<?>) claims.getOrDefault(AUTHORITIES_CLAIM, emptyList()))
                            .stream()
                            .map(Object::toString)
                            .collect(toSet())
            );

            request.setAttribute(USER_INFO_REQUEST_ATTRIBUTE, userInfo);
        }

        chain.doFilter(request, response);
    }

    private static String getStringClaim(Map<String, ?> claims, String key) {
        var value = claims.get(key);
        return (value != null) ? value.toString() : null;
    }


    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void destroy() {
    }
}
