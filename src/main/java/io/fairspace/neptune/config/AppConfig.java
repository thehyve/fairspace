package io.fairspace.neptune.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    @Bean
    HttpComponentsClientHttpRequestFactory authorizedRequestFactory() {
        return new AuthorizedClientHttpRequestFactory();
    }


    @Bean
    RestTemplate ceresRestTemplate() {
        return new RestTemplate(authorizedRequestFactory());
    }

}
