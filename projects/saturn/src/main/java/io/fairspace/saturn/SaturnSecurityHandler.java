package io.fairspace.saturn;

import io.fairspace.saturn.auth.OAuthAuthenticationToken;
import io.fairspace.saturn.config.Config;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;

import static io.fairspace.saturn.ThreadContext.setThreadContext;
import static io.fairspace.saturn.services.errors.ErrorHelper.errorBody;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;
import static org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON;

public class SaturnSecurityHandler extends ConstraintSecurityHandler {
    private static final Set<String> RESTRICTED_VOCABULARY_METHODS = Set.of("PUT", "PATCH", "DELETE");
    public static final String COMMIT_MESSAGE_HEADER = "Saturn-Commit-Message";

    private final Function<HttpServletRequest, OAuthAuthenticationToken> authenticator;
    private final String healthResource;
    private final String workspaceResource;
    private final String sparqlResource;
    private final String vocabularyResource;
    private final String projectsResource;
    private final String workspaceUserRole;
    private final String sparqlRole;
    private final String dataStewardRole;
    private final String fullAccessRole;
    private final Consumer<OAuthAuthenticationToken> onAuthorized;

    /**
     * @param apiPrefix
     * @param authenticator Authenticator returning a UserInfo for an incoming request
     * @param onAuthorized  An optional callback, called on successful authorization
     */
    public SaturnSecurityHandler(String apiPrefix, Config.Auth config, Function<HttpServletRequest, OAuthAuthenticationToken> authenticator, Consumer<OAuthAuthenticationToken> onAuthorized) {
        this.authenticator = authenticator;
        this.onAuthorized = onAuthorized;
        this.healthResource = apiPrefix + "/health/";
        this.workspaceResource = apiPrefix + "/workspace/";
        this.sparqlResource = apiPrefix + "/rdf/";
        this.vocabularyResource = apiPrefix + "/vocabulary/";
        this.projectsResource = apiPrefix + "/projects/";
        this.workspaceUserRole = config.workspaceUserRole;
        this.sparqlRole = config.sparqlRole;
        this.dataStewardRole = config.dataStewardRole;
        this.fullAccessRole = config.fullAccessRole;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        var error = authorize(pathInContext, request);

        if (error != null) {
            response.setContentType(APPLICATION_JSON.asString());
            response.setStatus(SC_UNAUTHORIZED);
            response.getWriter().write(errorBody(SC_UNAUTHORIZED, error));
            response.getWriter().flush();
            response.getWriter().close();
            baseRequest.setHandled(true);
        } else {
            getHandler().handle(pathInContext, baseRequest, request, response);
        }
    }

    private String authorize(String pathInContext, HttpServletRequest request) {
        if (healthResource.equals(pathInContext) || workspaceResource.equals(pathInContext) || projectsResource.equals(pathInContext)) {
            return null;
        }

        var userInfo = authenticator.apply(request);
        if (userInfo == null) {
            return "Unauthenticated";
        } else {
            var authorities = userInfo.getAuthorities();

            // Certain users with a specific role are allowed to do anything within a workspace
            if (!authorities.contains(fullAccessRole)) {
                if (!authorities.contains(workspaceUserRole)) {
                    return "Not a workspace user";
                } else if (pathInContext.startsWith(sparqlResource)) {
                    if (!authorities.contains(sparqlRole)) {
                        return "User is not allowed to access the SPARQL endpoint";
                    }
                } else if (pathInContext.startsWith(vocabularyResource)
                        && RESTRICTED_VOCABULARY_METHODS.contains(request.getMethod())
                        && !authorities.contains(dataStewardRole)) {
                    return "Only data stewards can edit the vocabulary";
                }
            }

            if (onAuthorized != null) {
                onAuthorized.accept(userInfo);
            }
        }

        var project = request.getParameter("project");
        // TODO: Apply project, check permissions

        setThreadContext(new ThreadContext(userInfo, request.getHeader(COMMIT_MESSAGE_HEADER), null));

        return null;
    }
}