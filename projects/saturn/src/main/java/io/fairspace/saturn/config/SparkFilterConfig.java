package io.fairspace.saturn.config;

import java.sql.SQLException;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import spark.servlet.SparkFilter;

import io.fairspace.saturn.rdf.SaturnDatasetFactory;
import io.fairspace.saturn.services.views.ViewStoreClientFactory;

import static io.fairspace.saturn.config.ConfigLoader.CONFIG;
import static io.fairspace.saturn.config.ConfigLoader.VIEWS_CONFIG;
import static io.fairspace.saturn.config.SparkFilterFactory.createSparkFilter;

/**
 * Configuration for the Spark filter to enable the Saturn API.
 */
@Configuration
public class SparkFilterConfig {

    // todo: make the init done by Spring
    @Bean
    public Services getService() {
        ViewStoreClientFactory viewStoreClientFactory = null;
        if (CONFIG.viewDatabase.enabled) {
            try {
                viewStoreClientFactory = new ViewStoreClientFactory(VIEWS_CONFIG, CONFIG.viewDatabase, CONFIG.search);
            } catch (SQLException e) {
                throw new RuntimeException("Error connecting to the view database", e);
            }
        }
        var ds = SaturnDatasetFactory.connect(CONFIG.jena, viewStoreClientFactory);

        return new Services(CONFIG, VIEWS_CONFIG, ds, viewStoreClientFactory);
    }

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
