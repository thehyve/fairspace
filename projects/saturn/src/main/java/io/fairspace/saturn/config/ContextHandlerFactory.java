package io.fairspace.saturn.config;

import io.fairspace.saturn.SaturnContextHandler;
import io.fairspace.saturn.auth.DummyAuthenticator;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.security.SecurityHandler;

import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;

@Slf4j
public class ContextHandlerFactory {
    public static SecurityHandler getContextHandler(Config.Auth authConfig, Services svc) {
        if (!authConfig.enabled) {
            log.warn("Authentication is disabled");
        }
        var authenticator = authConfig.enabled
                ? createAuthenticator(authConfig.jwksUrl, authConfig.jwtAlgorithm)
                : new DummyAuthenticator(authConfig.developerRoles);

        return new SaturnContextHandler(authConfig, authenticator, svc.getUserService()::onAuthorized);
    }
}
