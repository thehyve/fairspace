package nl.fairspace.pluto.config.dto;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Specifies the url patterns that are allowed for anyone, only
 * need authentication (user is logged in) or need full authorization
 * (i.e. user has the required authority to login)
 */
@ConfigurationProperties(prefix = "security.urls")
@Configuration
@Data
public class AppSecurityUrlConfig {
    private String[] permitAll = new String[0];
    private String[] needsAuthentication = new String[0];
    private String[] needsAuthorization = new String[0];
}
