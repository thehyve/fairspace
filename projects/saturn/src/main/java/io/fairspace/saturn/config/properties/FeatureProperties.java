package io.fairspace.saturn.config.properties;

import io.fairspace.saturn.config.Feature;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.Set;

@Data
@Component
@ConfigurationProperties(prefix = "application")
public class FeatureProperties {

    private Set<Feature> features;

}
