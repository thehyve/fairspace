package nl.fairspace.pluto.app.config.dto;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Collections;
import java.util.List;

@ConfigurationProperties(prefix = "app")
@Configuration
@Data
public class AppConfig {
    private String sessionCookieName = "JSESSIONID";
    private boolean forceHttps = true;
    private List<String> domains = Collections.emptyList();
}

