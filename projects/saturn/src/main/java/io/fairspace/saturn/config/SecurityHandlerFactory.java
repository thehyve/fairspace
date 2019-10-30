package io.fairspace.saturn.config;

import io.fairspace.saturn.SaturnSecurityHandler;
import io.fairspace.saturn.auth.DummyAuthenticator;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jetty.security.SecurityHandler;

import java.util.function.Consumer;

import static io.fairspace.saturn.auth.SecurityUtil.createAuthenticator;

@Slf4j
public class SecurityHandlerFactory {
    public static SecurityHandler getSecurityHandler(String apiPathPrefix, Config.Auth authConfig, Services svc, Consumer<String> onProject) {
        if (!authConfig.enabled) {
            log.warn("Authentication is disabled");
        }
        var authenticator = authConfig.enabled
                ? createAuthenticator(authConfig.jwksUrl, authConfig.jwtAlgorithm)
                : new DummyAuthenticator(authConfig.developerRoles);

        return new SaturnSecurityHandler(apiPathPrefix, authConfig, authenticator, svc.getUserService()::onAuthorized, onProject);
    }
}
