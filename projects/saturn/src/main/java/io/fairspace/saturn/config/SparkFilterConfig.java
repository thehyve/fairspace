package io.fairspace.saturn.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import spark.servlet.SparkFilter;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;

/**
 * Configuration for the Spark filter to enable the Saturn API.
 */
@Configuration
public class SparkFilterConfig {

    // todo: to be removed once switched to Spring MVC
    @Bean
    public FilterRegistrationBean<SparkFilter> sparkFilter(Services svc) {
        var registrationBean = new FilterRegistrationBean<SparkFilter>();
        var sparkFilter = createSparkFilter("/api", svc, CONFIG);
        registrationBean.setFilter(sparkFilter);
        registrationBean.addUrlPatterns("/api/*");
        return registrationBean;
    }
}
