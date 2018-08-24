package io.fairspace.neptune.config.upstream;

import io.fairspace.neptune.web.JsonldModelConverter;
import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicHeader;
import org.apache.jena.ext.com.google.common.collect.Lists;
import org.apache.jena.rdf.model.Model;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Configuration
public class UpstreamConnectionsConfig implements WebMvcConfigurer {
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
        return new AuthorizedClientHttpRequestFactory();
    }

    @Bean
    RestTemplate ceresRestTemplate() {
        RestTemplate restTemplate = new RestTemplate(authorizedRequestFactory());
        extendMessageConverters(restTemplate.getMessageConverters());
        return restTemplate;
    }
}
