package nl.fairspace.pluto.app.config;

import io.fairspace.oidc_auth.config.SecurityConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "security")
@Configuration
public class SecurityConfiguration extends SecurityConfig {
}
