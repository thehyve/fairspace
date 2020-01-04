package io.fairspace.saturn;

import io.fairspace.saturn.auth.OAuthAuthenticationToken;
import io.fairspace.saturn.config.Config;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.DispatcherType;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Stream;

import static io.fairspace.saturn.App.API_PREFIX;
import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static java.util.stream.Collectors.joining;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;

public class SaturnSecurityHandler extends ConstraintSecurityHandler {
    private static final Set<String> RESTRICTED_VOCABULARY_METHODS = Set.of("PUT", "PATCH", "DELETE");
    public static final String COMMIT_MESSAGE_HEADER = "Saturn-Commit-Message";
    public static final String PROJECTS_PREFIX = "/api/v1/projects/";
    public static final String PROJECT_ATTRIBUTE = "Project";


    private final Function<HttpServletRequest, OAuthAuthenticationToken> authenticator;
    private final String workspaceUserRole;
    private final String sparqlRole;
    private final String dataStewardRole;
    private final String fullAccessRole;
    private final Consumer<OAuthAuthenticationToken> onAuthorized;

    /**
     * @param authenticator Authenticator returning a UserInfo for an incoming request
     * @param onAuthorized  An optional callback, called on successful authorization
     */
    public SaturnSecurityHandler(Config.Auth config, Function<HttpServletRequest, OAuthAuthenticationToken> authenticator, Consumer<OAuthAuthenticationToken> onAuthorized) {
        this.authenticator = authenticator;
        this.onAuthorized = onAuthorized;
        this.workspaceUserRole = config.workspaceUserRole;
        this.sparqlRole = config.sparqlRole;
        this.dataStewardRole = config.dataStewardRole;
        this.fullAccessRole = config.fullAccessRole;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        // A second pass after forwarding?
        if (request.getAttribute(PROJECT_ATTRIBUTE) != null) {
            baseRequest.setDispatcherType(DispatcherType.REQUEST);
            getHandler().handle(pathInContext, baseRequest, request, response);
            return;
        }

        var error = authorize(pathInContext, request);

        if (error != null) {
            response.setContentType(APPLICATION_JSON.asString());
            response.setStatus(SC_UNAUTHORIZED);
            response.getWriter().write(errorBody(SC_UNAUTHORIZED, error));
            response.getWriter().flush();
            response.getWriter().close();
            baseRequest.setHandled(true);
        } else {
            if (pathInContext.startsWith(PROJECTS_PREFIX) && pathInContext.length() > PROJECTS_PREFIX.length()) {
                var parts = pathInContext.split("/");
                var project = parts[4];
                request.setAttribute(PROJECT_ATTRIBUTE, project);
                // TODO: Apply project

                // Fuseki doesn't like path parameters, so we handle it separately
                if (parts.length > 5 && parts[5].equals("rdf")) {
                    var newPath = Stream.of(parts).skip(5).collect(joining("/", API_PREFIX + "/", pathInContext.endsWith("/") ? "/" : ""));
                    request.getRequestDispatcher(newPath).forward(request, response);
                    return;
                }
            }

            getHandler().handle(pathInContext, baseRequest, request, response);
        }
    }

    private String authorize(String pathInContext, HttpServletRequest request) {
        switch (pathInContext) {
            case API_PREFIX + "/health/":
            case API_PREFIX + "/workspace/":
            case API_PREFIX + "/projects/":
                return null;
            default:
                var userInfo = authenticator.apply(request);
                if (userInfo == null) {
                    return "Unauthenticated";
                }
                var authorities = userInfo.getAuthorities();
                if (!authorities.contains(fullAccessRole)) {
                    if (!authorities.contains(workspaceUserRole)) {
                        return "Not a workspace user";
                    }
                    if (pathInContext.startsWith(PROJECTS_PREFIX)) {
                        var parts = pathInContext.split("/");
                        if (parts.length > 5) {
                            var api = parts[5];
                            if (api.equals("rdf") && !authorities.contains(sparqlRole)) {
                                return "User is not allowed to access the SPARQL endpoint";
                            }
                            if (api.equals("vocabulary")
                                    && RESTRICTED_VOCABULARY_METHODS.contains(request.getMethod())
                                    && !authorities.contains(dataStewardRole)) {
                                return "Only data stewards can edit the vocabulary";
                            }
                        }
                    }
                }
                if (onAuthorized != null) {
                    onAuthorized.accept(userInfo);
                }

                setThreadContext(new ThreadContext(userInfo, request.getHeader(COMMIT_MESSAGE_HEADER), null));
        }

        return null;
    }
}