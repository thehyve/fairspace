package nl.fairspace.pluto.app.config;

import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.boot.autoconfigure.security.oauth2.resource.UserInfoRestTemplateFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.AccessTokenProviderChain;
import org.springframework.security.oauth2.client.token.AccessTokenRequest;
import org.springframework.security.oauth2.client.token.RequestEnhancer;
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeAccessTokenProvider;
import org.springframework.util.MultiValueMap;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableOAuth2Sso
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                    .mvcMatchers(HttpMethod.OPTIONS).permitAll()
                    .antMatchers("/actuator/health").permitAll()
                    .anyRequest().authenticated()
                .and()
                    .cors().configurationSource(corsConfigurationSource())
                .and()
                    .logout()
                    .logoutSuccessUrl("http://localhost:9080/auth/realms/jhipster/protocol/openid-connect/logout?redirect_uri=http%3A%2F%2Fwww.google.com%0D%0A")
                .and()
                    .csrf().disable();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.applyPermitDefaultValues();

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration);
        return source;
    }

    @Bean
    public OAuth2RestTemplate restTemplate(UserInfoRestTemplateFactory factory) {
        // By default, spring initializes the rest template with an AuthorizationCodeAccessTokenProvider
        // However, that provider does not contain functionality to refresh the access token after it is
        // expired.
        // By wrapping the provider into the AccessTokenProviderChain, we do get the refresh functionality.
        // However, this requires some manual setup of the restTemplate
        AuthorizationCodeAccessTokenProvider accessTokenProvider = new AuthorizationCodeAccessTokenProvider();
        accessTokenProvider.setTokenRequestEnhancer(new AcceptJsonRequestEnhancer());

        OAuth2RestTemplate restTemplate = factory.getUserInfoRestTemplate();
        restTemplate.setAccessTokenProvider(new AccessTokenProviderChain(Collections.singletonList(accessTokenProvider)));

        return restTemplate;
    }

    private static class AcceptJsonRequestEnhancer implements RequestEnhancer {
        @Override
        public void enhance(AccessTokenRequest request,
                            OAuth2ProtectedResourceDetails resource,
                            MultiValueMap<String, String> form, HttpHeaders headers) {
            headers.setAccept(Arrays.asList(MediaType.APPLICATION_JSON));
        }
    }
}
