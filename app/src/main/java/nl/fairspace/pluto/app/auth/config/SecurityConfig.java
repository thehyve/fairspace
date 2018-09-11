package nl.fairspace.pluto.app.auth.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "security")
@Configuration
@Data
public class SecurityConfig {
    private OAuth2Config oauth2;
    private AppSecurityUrlConfig urls;
}
