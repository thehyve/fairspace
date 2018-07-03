package io.fairspace.neptune;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    RestTemplate ceresRestTemplate() {
        return new RestTemplate();
    }

}
