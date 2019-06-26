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

import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

class SaturnSecurityHandler extends ConstraintSecurityHandler { ;
    private static final Set<String> RESTRICTED_VOCABULARY_METHODS = Set.of("PUT", "PATCH", "DELETE");

    private final String healthResource;
    private final String sparqlResource;
    private final String vocabularyResource;

    private final Function<HttpServletRequest, UserInfo> authenticator;
    private final Config.Auth config;

    /**
     * @param apiPrefix
     * @param authenticator Authenticator returning a UserInfo for an incoming request
     */
    SaturnSecurityHandler(String apiPrefix, Config.Auth config, Function<HttpServletRequest, UserInfo> authenticator) {
        this.healthResource = apiPrefix + "health/";
        this.sparqlResource = apiPrefix + "rdf/";
        this.vocabularyResource = apiPrefix + "vocabulary/";

        this.config = config;
        this.authenticator = authenticator;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        String rejectionMessage = null;

        if (!healthResource.equals(pathInContext)) {
            var userInfo = authenticator.apply(request);
            if (userInfo == null) {
                rejectionMessage = "Unauthenticated";
            } else {
                var authorities = userInfo.getAuthorities();
                if (!authorities.contains(config.workspaceUserRole)) {
                    rejectionMessage = "Not a workspace user";
                } else if (pathInContext.startsWith(sparqlResource)) {
                    if (!authorities.contains(config.sparqlRole)) {
                        rejectionMessage = "User is not allowed to access the SPARQL endpoint";
                    }
                } else if (pathInContext.startsWith(vocabularyResource)) {
                    if (RESTRICTED_VOCABULARY_METHODS.contains(request.getMethod()) && !authorities.contains(config.dataStewardRole)) {
                        rejectionMessage = "Only data stewards can edit the vocabulary";
                    }
                }
            }
        }

        if (rejectionMessage != null) {
            response.sendError(SC_UNAUTHORIZED, rejectionMessage);
            baseRequest.setHandled(true);
            return;
        }

        getHandler().handle(pathInContext, baseRequest, request, response);
    }
}
