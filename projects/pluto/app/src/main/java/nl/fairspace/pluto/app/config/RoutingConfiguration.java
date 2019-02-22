package nl.fairspace.pluto.app.config;

import org.apache.http.impl.client.CloseableHttpClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.cloud.commons.httpclient.ApacheHttpClientConnectionManagerFactory;
import org.springframework.cloud.commons.httpclient.ApacheHttpClientFactory;
import org.springframework.cloud.netflix.zuul.filters.ProxyRequestHelper;
import org.springframework.cloud.netflix.zuul.filters.ZuulProperties;
import org.springframework.cloud.netflix.zuul.filters.route.SimpleHostRoutingFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RoutingConfiguration {
    @Bean
    @ConditionalOnMissingBean({SimpleHostRoutingFilter.class, CloseableHttpClient.class})
    public WebDAVHostRoutingFilter webDAVHostRoutingFilter(ProxyRequestHelper helper,
                                                           ZuulProperties zuulProperties,
                                                           ApacheHttpClientConnectionManagerFactory connectionManagerFactory,
                                                           ApacheHttpClientFactory httpClientFactory) {
        return new WebDAVHostRoutingFilter(helper, zuulProperties,
                connectionManagerFactory, httpClientFactory);
    }

    @Bean
    @ConditionalOnMissingBean({SimpleHostRoutingFilter.class})
    public WebDAVHostRoutingFilter webDAVHostRoutingFilter2(ProxyRequestHelper helper,
                                                            ZuulProperties zuulProperties,
                                                            CloseableHttpClient httpClient) {
        return new WebDAVHostRoutingFilter(helper, zuulProperties,
                httpClient);
    }
}
