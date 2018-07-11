package nl.fairspace.pluto.app.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "app")
@Configuration
@Data
public class AppConfig {
    private AppOAuth2Config oauth2;
    private AppSecurityUrlConfig urls ;
}

