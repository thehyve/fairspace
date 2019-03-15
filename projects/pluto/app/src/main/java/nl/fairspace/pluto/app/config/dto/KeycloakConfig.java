package nl.fairspace.pluto.app.config.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "keycloak")
@Component
@Data
public class KeycloakConfig {
    private String usersUriPattern;
    private String workspaceLoginGroup;
    private String groupUri;
}

