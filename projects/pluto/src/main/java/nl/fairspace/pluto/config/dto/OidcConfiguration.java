package nl.fairspace.pluto.config.dto;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import nl.fairspace.pluto.auth.config.OidcConfig;

@ConfigurationProperties(prefix = "security.oidc")
@Configuration
@Getter
@Setter
@EqualsAndHashCode(callSuper = false)
public class OidcConfiguration extends OidcConfig {
    private String requiredAuthority;
}
