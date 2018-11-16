package io.fairspace.neptune.config.upstream;

import io.fairspace.neptune.metadata.ceres.JsonldModelConverter;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.jena.rdf.model.Model;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class UpstreamConnectionsConfig implements WebMvcConfigurer {
    @Value("${app.connectTimeout}")
    int connectTimeout;

    @Value("${app.readTimeout}")
    int readTimeout;

    @Bean
    HttpMessageConverter<Model> jsonldModelConverter() {
        return new JsonldModelConverter();
    }

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.remove(jsonldModelConverter());
        converters.add(0, jsonldModelConverter());
    }

    @Bean
    CloseableHttpClient httpClient() {
        return HttpClients.createDefault();
    }

    @Bean
    HttpComponentsClientHttpRequestFactory authorizedRequestFactory() {
        AuthorizedClientHttpRequestFactory factory = new AuthorizedClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeout);
        factory.setReadTimeout(readTimeout);
        return factory;
    }

    @Bean
    RestTemplate authorizedRestTemplate() {
        RestTemplate restTemplate = new RestTemplate(authorizedRequestFactory());
        extendMessageConverters(restTemplate.getMessageConverters());
        return restTemplate;
    }
}
