package io.fairspace.saturn.auth;

import io.fairspace.saturn.config.Config;
import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.session.SessionHandler;
import org.eclipse.jetty.util.security.Constraint;
import org.keycloak.common.enums.SslRequired;
import org.keycloak.enums.TokenStore;
import org.keycloak.representations.adapters.config.AdapterConfig;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static java.lang.System.getenv;

public class SaturnSecurityHandler extends ConstraintSecurityHandler {
    public SaturnSecurityHandler(Config.Auth config) {
        setAuthenticator(new SaturnKeycloakJettyAuthenticator(adapterConfig(config)));
        addConstraintMapping(constraintMapping("/*", true));
        addConstraintMapping(constraintMapping("/api/v1/health/", false));
    }

    private static AdapterConfig adapterConfig(Config.Auth config) {
        var adapterConfig = new AdapterConfig();
        adapterConfig.setResource(config.clientId);
        adapterConfig.setRealm(config.realm);
        adapterConfig.setAuthServerUrl(CONFIG.auth.authServerUrl);
        adapterConfig.setTokenStore(TokenStore.SESSION.name());
        adapterConfig.setCredentials(Map.of("secret",  getenv("KEYCLOAK_CLIENT_SECRET")));

        var localhost = CONFIG.auth.authServerUrl.startsWith("http://localhost:");
        adapterConfig.setSslRequired(SslRequired.NONE.name());
        if(!localhost) {
            adapterConfig.setConfidentialPort(443);
        }
        return adapterConfig;
    }

    private static ConstraintMapping constraintMapping(String pathSpec, boolean authenticate) {
        var constraint = new Constraint();
        constraint.setRoles(new String[] {Constraint.ANY_AUTH});
        constraint.setAuthenticate(authenticate);
        var mapping = new ConstraintMapping();
        mapping.setConstraint(constraint);
        mapping.setPathSpec(pathSpec);
        return mapping;
    }

    @Override
    public void handle(String pathInContext, Request baseRequest, HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        var cookie = new Cookie("JSESSIONID", ((SessionHandler.SessionIf)request.getSession()).getSession().getExtendedId());
        cookie.setPath("/");
        response.addCookie(cookie);
        super.handle(pathInContext, baseRequest, request, response);
    }
}
