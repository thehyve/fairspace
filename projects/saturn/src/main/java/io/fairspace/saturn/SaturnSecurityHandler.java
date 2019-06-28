package io.fairspace.saturn;

import io.fairspace.saturn.auth.UserInfo;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import java.util.function.Function;

import static io.fairspace.saturn.Context.currentRequest;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

class SaturnSecurityHandler extends ConstraintSecurityHandler {
    private static final String USER_INFO_REQUEST_ATTRIBUTE = UserInfo.class.getName();
    private static final Set<String> RESTRICTED_VOCABULARY_METHODS = Set.of("PUT", "PATCH", "DELETE");

    private final Function<HttpServletRequest, UserInfo> authenticator;
    private final String healthResource;
    private final String sparqlResource;
    private final String vocabularyResource;
    private final String workspaceUserRole;
    private final String sparqlRole;
    private final String dataStewardRole;

    /**
     * @param apiPrefix
     * @param authenticator Authenticator returning a UserInfo for an incoming request
     */
    SaturnSecurityHandler(String apiPrefix, Config.Auth config, Function<HttpServletRequest, UserInfo> authenticator) {
        this.authenticator = authenticator;
        this.healthResource = apiPrefix + "/health/";
        this.sparqlResource = apiPrefix + "/rdf/";
        this.vocabularyResource = apiPrefix + "/vocabulary/";
        this.workspaceUserRole = config.workspaceUserRole;
        this.sparqlRole = config.sparqlRole;
        this.dataStewardRole = config.dataStewardRole;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        var error = authorize(pathInContext, request);

        if (error != null) {
            response.sendError(SC_UNAUTHORIZED, error);
            baseRequest.setHandled(true);
        } else {
            getHandler().handle(pathInContext, baseRequest, request, response);
        }
    }

    private String authorize(String pathInContext, HttpServletRequest request) {
        if (healthResource.equals(pathInContext)) {
            return null;
        }

        var userInfo = authenticator.apply(request);
        if (userInfo == null) {
            return "Unauthenticated";
        } else {
            request.setAttribute(USER_INFO_REQUEST_ATTRIBUTE, userInfo);
            var authorities = userInfo.getAuthorities();

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

        return null;
    }

    public static UserInfo userInfo() {
        return currentRequest()
                .map(request -> (UserInfo) request.getAttribute(USER_INFO_REQUEST_ATTRIBUTE))
                .orElse(null);
    }
}
