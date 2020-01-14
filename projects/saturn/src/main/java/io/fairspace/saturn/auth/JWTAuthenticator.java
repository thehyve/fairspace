package io.fairspace.saturn.auth;

import com.nimbusds.jwt.JWTParser;
import io.fairspace.saturn.services.users.User;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.function.Function;

import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static org.apache.http.HttpHeaders.AUTHORIZATION;

@Slf4j
public class JWTAuthenticator implements Function<HttpServletRequest, User>  {
    private static final String BEARER_PREFIX = "Bearer ";

    private final String adminRole;

    public JWTAuthenticator(String adminRole) {
        this.adminRole = adminRole;
    }


    @Override
    public User apply(HttpServletRequest request) {
        var authorizationHeader = request.getHeader(AUTHORIZATION);

        if (authorizationHeader == null) {
            log.debug("No authorization header was provided for {}", request.getRequestURI());
            return null;
        }

        if (!authorizationHeader.startsWith(BEARER_PREFIX)) {
            log.warn("Invalid authorization header was provided for {}", request.getRequestURI());
            return null;
        }

        var token = authorizationHeader.substring(BEARER_PREFIX.length());

        try {
            var claims = JWTParser.parse(token).getJWTClaimsSet();
            var user = new User();
            user.setIri(generateMetadataIri(claims.getStringClaim("subject")));
            user.setName(claims.getStringClaim("name"));
            user.setEmail(claims.getStringClaim("email"));
            user.setAdmin(claims.getStringListClaim("authorities").contains(adminRole));

            return user;
        } catch (ParseException e) {
            log.error("Error parsing a JWT", e);
            return null;
        }
    }
}
