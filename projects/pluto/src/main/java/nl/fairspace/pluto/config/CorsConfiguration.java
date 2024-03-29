package nl.fairspace.pluto.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import nl.fairspace.pluto.config.dto.PlutoConfig;

@Configuration
public class CorsConfiguration extends org.springframework.web.cors.CorsConfiguration {

    PlutoConfig plutoConfig;

    public CorsConfiguration(PlutoConfig plutoConfig) {
        this.plutoConfig = plutoConfig;
    }

    @Bean
    CorsWebFilter corsWebFilter() {
        org.springframework.web.cors.CorsConfiguration corsConfiguration =
                new org.springframework.web.cors.CorsConfiguration();
        corsConfiguration.setAllowCredentials(true);

        corsConfiguration.setAllowedOrigins(plutoConfig.getDomains());
        corsConfiguration.setAllowedMethods(List.of("*"));
        corsConfiguration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);

        return new CorsWebFilter(source);
    }
}
