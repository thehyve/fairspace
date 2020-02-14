package io.fairspace.saturn.auth;

import com.nimbusds.jwt.JWTParser;
import io.fairspace.saturn.services.users.Role;
import io.fairspace.saturn.services.users.User;
import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.util.function.Function;

import static io.fairspace.saturn.ThreadContext.getThreadContext;
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
            user.setIri(generateMetadataIri(claims.getStringClaim("sub")));
            user.setName(claims.getStringClaim("name"));
            user.setEmail(claims.getStringClaim("email"));
            var authorities = claims.getStringListClaim("authorities");

            var isAdmin = authorities.contains(adminRole);
            var workspace = getThreadContext().getWorkspace();

            if (isAdmin || authorities.contains("workspace-" + workspace + "-coordinator")) {
                user.getRoles().add(Role.CanRead);
                user.getRoles().add(Role.CanWrite);
                user.getRoles().add(Role.SparqlUser);
                user.getRoles().add(Role.DataSteward);
                user.getRoles().add(Role.Coordinator);;
            } else if (authorities.contains("workspace-" + workspace + "-datasteward")) {
                user.getRoles().add(Role.CanRead);
                user.getRoles().add(Role.CanWrite);
                user.getRoles().add(Role.SparqlUser);
                user.getRoles().add(Role.DataSteward);
            } else if (authorities.contains("workspace-" + workspace + "-write")) {
                user.getRoles().add(Role.CanRead);
                user.getRoles().add(Role.CanWrite);
                user.getRoles().add(Role.SparqlUser);
            } else if (authorities.contains("workspace-" + workspace + "-user")) {
                user.getRoles().add(Role.CanRead);
                user.getRoles().add(Role.SparqlUser);
            }

            return user;
        } catch (ParseException e) {
            log.error("Error parsing a JWT", e);
            return null;
        }
    }
}
