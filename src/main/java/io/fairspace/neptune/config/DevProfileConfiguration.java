package io.fairspace.neptune.config;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import javax.annotation.Priority;

@Configuration
@Profile("dev")
@EnableWebSecurity
public class DevProfileConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .anyRequest().permitAll()
                .and()
                .csrf().disable();
    }

    @Bean
    AuthorizationContainer noopAuthorizationContainer() {
        return new AuthorizationContainer() {
            @Override
            public String getSubject() {
                return "noauth";
            }
        };
    }
}
