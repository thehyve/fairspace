package io.fairspace.neptune.config;

import io.fairspace.neptune.web.JsonldModelConverter;
import org.apache.jena.rdf.model.Model;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class AppConfig implements WebMvcConfigurer {
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
