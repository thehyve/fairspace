package nl.fairspace.pluto.app.config.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@ConfigurationProperties(prefix = "workspace")
@Component
@Data
@JsonIgnoreProperties("$$beanFactory")
public class WorkspaceDetails {
    private String name;
    private String version;
}

