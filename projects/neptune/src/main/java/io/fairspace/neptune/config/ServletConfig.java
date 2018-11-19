package io.fairspace.neptune.config;

import org.springframework.boot.web.server.MimeMappings;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ServletConfig implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {
    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        MimeMappings mimeMappings = new MimeMappings(MimeMappings.DEFAULT);
        mimeMappings.add("jsonld", "application/ld+json");
        factory.setMimeMappings(mimeMappings);
    }
}
