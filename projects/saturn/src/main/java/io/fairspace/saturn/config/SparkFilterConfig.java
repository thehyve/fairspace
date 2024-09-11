package io.fairspace.saturn.config;

import io.fairspace.saturn.config.properties.FeatureProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import spark.servlet.SparkFilter;

import java.util.Arrays;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;

/**
 * Configuration for the Spark filter to enable the Saturn API.
 */
@Configuration
public class SparkFilterConfig {

    // todo: to be removed once switched to Spring MVC
    @Bean
    public FilterRegistrationBean<SparkFilter> sparkFilter(Services svc, FeatureProperties featureProperties,
                                                           @Value("${application.publicUrl}") String publicUrl) {
        var registrationBean = new FilterRegistrationBean<SparkFilter>();
        var sparkFilter = createSparkFilter("/api", svc, CONFIG, featureProperties, publicUrl);
        registrationBean.setFilter(sparkFilter);
        // we cannot set /api/* as the url pattern, because it would override /api/webdav/*
        // endpoints which defined as a separate servlet
        String[] urls = Arrays.stream(sparkFilter.getUrls())
                .map(url -> url + "/*")
                .toArray(String[]::new);
        registrationBean.addUrlPatterns(urls);
        return registrationBean;
    }
}
