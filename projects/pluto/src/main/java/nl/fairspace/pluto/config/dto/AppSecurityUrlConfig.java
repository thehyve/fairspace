package nl.fairspace.pluto.config.dto;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Specifies the url patterns that are allowed for anyone
 */
@ConfigurationProperties(prefix = "security.urls")
@Configuration
@Data
public class AppSecurityUrlConfig {
    private String[] permitAll = new String[0];
}
