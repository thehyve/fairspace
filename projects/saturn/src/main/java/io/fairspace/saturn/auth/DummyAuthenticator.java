package io.fairspace.saturn.auth;

import io.fairspace.saturn.services.users.Role;
import io.fairspace.saturn.services.users.User;
import lombok.AllArgsConstructor;

import javax.servlet.http.HttpServletRequest;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;

import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static java.util.stream.Collectors.toSet;


// For local development only
@AllArgsConstructor
public class DummyAuthenticator implements Function<HttpServletRequest, User> {
    private final Set<Role> developerRoles;

    @Override
    public User apply(HttpServletRequest request) {
        // Allow the client to provide some authorities
        var authoritiesHeader = request.getHeader("x-fairspace-authorities");
        var roles = authoritiesHeader == null
                ? developerRoles
                : Stream.of(authoritiesHeader.split(",")).map(Role::valueOf).collect(toSet());

        var user = new User();
        user.setIri(generateMetadataIri("6e6cde34-45bc-42d8-8cdb-b6e9faf890d3"));
        user.setName("John Snow");
        user.setEmail("user@example.com");
        user.getRoles().addAll(roles);
        user.setAdmin(true);

        return user;
    }
}
