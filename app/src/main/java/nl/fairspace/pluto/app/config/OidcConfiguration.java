package nl.fairspace.pluto.app.config;

import io.fairspace.oidc_auth.config.OidcConfig;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "security.oidc")
@Configuration
@Data
public class OidcConfiguration extends OidcConfig {
    private String requiredAuthority;
}
