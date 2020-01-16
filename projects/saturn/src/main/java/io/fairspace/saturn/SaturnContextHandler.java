package io.fairspace.saturn;

import io.fairspace.saturn.services.users.Role;
import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.DispatcherType;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Stream;

import static io.fairspace.saturn.App.API_PREFIX;
import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static java.util.stream.Collectors.joining;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;

@Slf4j
public class SaturnContextHandler extends ConstraintSecurityHandler {
    private static final Set<String> RESTRICTED_VOCABULARY_METHODS = Set.of("PUT", "PATCH", "DELETE");
    public static final String COMMIT_MESSAGE_HEADER = "Saturn-Commit-Message";
    public static final String PROJECTS_PREFIX = API_PREFIX + "/projects/";
    public static final String FORWARDED_ATTRIBUTE = "forwarded";


    private final Function<HttpServletRequest, User> authenticator;
    private final UserService userService;

    /**
     * @param userService
     * @param authenticator Authenticator returning a UserInfo for an incoming request
     */
    public SaturnContextHandler(UserService userService, Function<HttpServletRequest, User> authenticator) {
        this.userService = userService;
        this.authenticator = authenticator;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        // A second pass after forwarding?
        if (request.getAttribute(FORWARDED_ATTRIBUTE) != null) {
            baseRequest.setDispatcherType(DispatcherType.REQUEST);
        } else if (pathInContext.startsWith(PROJECTS_PREFIX) && pathInContext.length() > PROJECTS_PREFIX.length()) {
            // /api/v1/projects/{project}/{resource}/**
            var subPath = pathInContext.substring(PROJECTS_PREFIX.length());
            var parts = subPath.split("/");
            if (parts.length > 0) {
                var context = new ThreadContext();
                setThreadContext(context);

                var project = parts[0];
                context.setProject(project);

                var userInfo = authenticator.apply(request);
                if (userInfo == null) {
                    sendError("Unauthenticated", response);
                    return;
                }

                log.debug("Authenticated as {} {}", userInfo.getName(), userInfo.getIri());

                var user = userService.trySetCurrentUser(userInfo);

                if (user == null) {
                    sendError("You have no access to this project", response);
                    return;
                }

                if (user.getRoles().isEmpty()) {
                    sendError("Your access to this project has been revoked", response);
                    return;
                }

                context.setUser(user);
                context.setUserCommitMessage(request.getHeader(COMMIT_MESSAGE_HEADER));

                if (parts.length > 1) {
                    var resource = parts[1];
                    switch (resource) {
                        case "vocabulary":
                            if (RESTRICTED_VOCABULARY_METHODS.contains(request.getMethod()) &&
                                    !user.getRoles().contains(Role.DataSteward) &&
                                    !user.getRoles().contains(Role.Coordinator)) {
                                sendError("Only data stewards and project coordinators can edit the vocabulary", response);
                                return;
                            }
                            break;
                        case "rdf":
                            if (!user.getRoles().contains(Role.SparqlUser) && !user.getRoles().contains(Role.Coordinator)) {
                                sendError("User is not allowed to access the SPARQL endpoint", response);
                                return;
                            }

                            // Fuseki doesn't like path parameters, so we hack the path and forward the request
                            var newPath = Stream.of(parts).skip(1).collect(joining("/", API_PREFIX + "/", pathInContext.endsWith("/") ? "/" : ""));
                            request.setAttribute(FORWARDED_ATTRIBUTE, true);
                            request.getRequestDispatcher(newPath).forward(request, response);
                            return;
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
        }

        getHandler().handle(pathInContext, baseRequest, request, response);
    }

    private void sendError(String error, HttpServletResponse response) throws IOException {
        response.setContentType(APPLICATION_JSON.asString());
        response.setStatus(SC_UNAUTHORIZED);
        response.getWriter().write(errorBody(SC_UNAUTHORIZED, error));
        response.getWriter().flush();
        response.getWriter().close();
    }
}