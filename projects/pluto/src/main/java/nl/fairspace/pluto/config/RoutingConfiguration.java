package nl.fairspace.pluto.config;

import org.springframework.cloud.gateway.config.GatewayProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import nl.fairspace.pluto.config.dto.PlutoConfig;

@Configuration
public class RoutingConfiguration {

    @Bean
    public WebDAVHostRoutingFilter webDAVHostRoutingFilter() {
        return new WebDAVHostRoutingFilter();
    }

    @Bean
    public WebDAVPathRewritingFilter webDAVPathRewritingFilter(
            PlutoConfig plutoConfig, GatewayProperties gatewayProperties) {
        return new WebDAVPathRewritingFilter(plutoConfig, gatewayProperties);
    }
}
