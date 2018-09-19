package nl.fairspace.pluto.app.config.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "frontend")
@Component
@Data
@JsonIgnoreProperties("$$beanFactory")
public class FrontendConfig {
    // Map with urls for external applications
    private Map<String, String> urls = new HashMap<>();
}

