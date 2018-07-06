package io.fairspace.neptune.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.security.oauth2.resource.ResourceServerProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer;

@Configuration
@Profile("!dev")
@EnableResourceServer
public class WebSecurityConfiguration {
    @Autowired
    ResourceServerProperties resourceServerProperties;

    @Bean
    @ConditionalOnMissingBean(ResourceServerConfigurer.class)
    public ResourceServerConfigurer resourceServer() {
        return new ResourceSecurityConfigurer(this.resourceServerProperties);
    }

    protected static class ResourceSecurityConfigurer
            extends ResourceServerConfigurerAdapter {

        private ResourceServerProperties resource;

        public ResourceSecurityConfigurer(ResourceServerProperties resource) {
            this.resource = resource;
        }

        @Override
        public void configure(ResourceServerSecurityConfigurer resources)
                throws Exception {
            resources.resourceId(this.resource.getResourceId());
        }

        @Override
        public void configure(HttpSecurity http) throws Exception {
            http
                    .authorizeRequests()
                    .antMatchers("/actuator/health").permitAll()
                    .anyRequest().authenticated();
        }
    }

}
