package io.fairspace.saturn.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import io.fairspace.saturn.auth.JwtAuthConverterProperties;
import io.fairspace.saturn.services.IRIModule;

@ImportAutoConfiguration(exclude = {SecurityAutoConfiguration.class, OAuth2ResourceServerAutoConfiguration.class})
@Import(BaseControllerTest.CustomObjectMapperConfig.class)
public class BaseControllerTest {

    @MockBean
    private JwtAuthConverterProperties jwtAuthConverterProperties;

    @TestConfiguration
    static class CustomObjectMapperConfig {
        @Bean
        public ObjectMapper objectMapper() {
            return new ObjectMapper()
                    .registerModule(new IRIModule())
                    .findAndRegisterModules(); // Automatically registers JavaTimeModule, etc.
        }
    }
}
