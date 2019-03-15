package nl.fairspace.pluto.app.config.dto;

import lombok.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "keycloak")
@Component
@Value
public class KeycloakConfig {
    String usersUriPattern;
    String workspaceLoginGroup;
    String groupUri;
}

