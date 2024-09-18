package io.fairspace.saturn.config;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import spark.servlet.SparkFilter;

import io.fairspace.saturn.config.properties.FeatureProperties;
import io.fairspace.saturn.config.properties.KeycloakClientProperties;

import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;

/**
 * Configuration for the Spark filter to enable the Saturn API.
 */
@Configuration
public class SparkFilterConfig {

    // todo: to be removed once switched to Spring MVC
    @Bean
    public FilterRegistrationBean<SparkFilter> sparkFilter(
            Services svc,
            FeatureProperties featureProperties,
            KeycloakClientProperties keycloakClientProperties,
            @Value("${application.publicUrl}") String publicUrl) {
        var registrationBean = new FilterRegistrationBean<SparkFilter>();
        var sparkFilter = createSparkFilter("/api", svc, keycloakClientProperties, featureProperties, publicUrl);
        registrationBean.setFilter(sparkFilter);
        // we cannot set /api/* as the url pattern, because it would override /api/webdav/*
        // endpoints which defined as a separate servlet
        String[] urls =
                Arrays.stream(sparkFilter.getUrls()).map(url -> url + "/*").toArray(String[]::new);
        registrationBean.addUrlPatterns(urls);
        return registrationBean;
    }
}
