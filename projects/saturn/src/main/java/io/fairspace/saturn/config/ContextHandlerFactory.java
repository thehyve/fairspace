package io.fairspace.saturn.config;

import io.fairspace.saturn.SaturnSecurityHandler;
import io.fairspace.saturn.auth.DummyAuthenticator;
import io.fairspace.saturn.auth.JWTAuthenticator;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.security.SecurityHandler;


@Slf4j
public class ContextHandlerFactory {
    public static SecurityHandler getContextHandler(Config.Auth authConfig, Services svc) {
        if (!authConfig.enabled) {
            log.warn("Authentication is disabled");
        }
        var authenticator = authConfig.enabled
                ? new JWTAuthenticator(authConfig.fullAccessRole)
                : new DummyAuthenticator(authConfig.developerRoles);

        return new SaturnSecurityHandler(svc.getUserService(), authenticator);
    }
}
