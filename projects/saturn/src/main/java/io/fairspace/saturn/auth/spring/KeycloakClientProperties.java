package io.fairspace.saturn.auth.spring;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "keycloak")
public class KeycloakClientProperties {

    private String authServerUrl;
    private String realm;
    private String clientId;
    private String clientSecret;
}
