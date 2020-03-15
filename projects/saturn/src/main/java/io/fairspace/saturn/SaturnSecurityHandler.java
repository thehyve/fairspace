package io.fairspace.saturn;

import io.fairspace.saturn.services.users.Role;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.function.Function;

import static io.fairspace.saturn.App.API_PREFIX;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static io.fairspace.saturn.services.users.User.setCurrentUser;
import static javax.servlet.http.HttpServletResponse.SC_FORBIDDEN;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;

@Slf4j
public class SaturnSecurityHandler extends ConstraintSecurityHandler {
    private static final Set<String> RESTRICTED_VOCABULARY_METHODS = Set.of("PUT", "PATCH", "DELETE");


    private final Function<HttpServletRequest, User> authenticator;
    private final UserService userService;

    /**
     * @param userService
     * @param authenticator Authenticator returning a UserInfo for an incoming request
     */
    public SaturnSecurityHandler(UserService userService, Function<HttpServletRequest, User> authenticator) {
        this.userService = userService;
        this.authenticator = authenticator;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        // A second pass after forwarding?

        var subPath = pathInContext.substring(API_PREFIX.length());
        var parts = subPath.split("/");
        if (parts.length > 1) {
            var resource = parts[1];

            if (!resource.equals("health")) {
                var user = authenticator.apply(request);
                if (user == null) {
                    sendError(SC_UNAUTHORIZED, "Unauthenticated", response);
                    return;
                }

                log.debug("Authenticated as {} {}", user.getName(), user.getIri());

                if (user.getRoles().isEmpty()) {
                    sendError(SC_FORBIDDEN, "You have no access to this workspace", response);
                    return;
                }

                setCurrentUser(user);

                switch (resource) {
                    case "vocabulary":
                        if (RESTRICTED_VOCABULARY_METHODS.contains(request.getMethod()) &&
                                !user.getRoles().contains(Role.DataSteward) &&
                                !user.getRoles().contains(Role.Coordinator)) {
                            sendError(SC_FORBIDDEN, "Only data stewards and workspace coordinators can edit the vocabulary", response);
                            return;
                        }
                        break;
                    case "rdf":
                        if (!user.getRoles().contains(Role.SparqlUser) && !user.getRoles().contains(Role.Coordinator)) {
                            sendError(SC_FORBIDDEN, "User is not allowed to access the SPARQL endpoint", response);
                            return;
                        }
                    case "collections":
                    case "metadata":
                    case "meta-vocabulary":
                    case "users":
                    case "permissions":
                    default:
                        // Permission checks are handled by the corresponding APIs
                }
            }
        }

        getHandler().handle(pathInContext, baseRequest, request, response);
    }

    private void sendError(int status, String error, HttpServletResponse response) throws IOException {
        response.setContentType(APPLICATION_JSON.asString());
        response.setStatus(status);
        response.getWriter().write(errorBody(status, error));
        response.getWriter().flush();
        response.getWriter().close();
    }
}