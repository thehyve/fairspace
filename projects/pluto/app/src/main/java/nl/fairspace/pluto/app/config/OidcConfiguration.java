package nl.fairspace.pluto.app.config;

import io.fairspace.oidc_auth.config.OidcConfig;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "security.oidc")
@Configuration
@Getter
@Setter
@EqualsAndHashCode(callSuper = false)
public class OidcConfiguration extends OidcConfig {
    private String requiredAuthority;
}
