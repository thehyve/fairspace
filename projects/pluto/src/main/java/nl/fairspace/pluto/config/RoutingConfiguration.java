package nl.fairspace.pluto.config;

import nl.fairspace.pluto.config.dto.PlutoConfig;
import org.springframework.cloud.gateway.config.GatewayProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoutingConfiguration {
    @Bean
    public WebDAVHostRoutingFilter webDAVHostRoutingFilter() {
        return new WebDAVHostRoutingFilter();
    }

    @Bean
    public WebDAVPathRewritingFilter webDAVPathRewritingFilter(PlutoConfig plutoConfig, GatewayProperties gatewayProperties) {
        return new WebDAVPathRewritingFilter(plutoConfig, gatewayProperties);
    }
}
