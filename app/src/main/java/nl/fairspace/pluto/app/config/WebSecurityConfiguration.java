package nl.fairspace.pluto.app.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2SsoProperties;
import org.springframework.boot.autoconfigure.security.oauth2.resource.UserInfoRestTemplateFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.ExceptionHandlingConfigurer;
import org.springframework.security.oauth2.client.OAuth2RestTemplate;
import org.springframework.security.oauth2.client.resource.OAuth2ProtectedResourceDetails;
import org.springframework.security.oauth2.client.token.AccessTokenProviderChain;
import org.springframework.security.oauth2.client.token.AccessTokenRequest;
import org.springframework.security.oauth2.client.token.RequestEnhancer;
import org.springframework.security.oauth2.client.token.grant.code.AuthorizationCodeAccessTokenProvider;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.RequestHeaderRequestMatcher;
import org.springframework.util.MultiValueMap;
import org.springframework.web.accept.ContentNegotiationStrategy;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableOAuth2Sso
@EnableWebSecurity
@Profile("!noAuth")
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {
    @Autowired
    AppConfig appConfig;

    @Autowired
    OAuth2SsoProperties sso;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors().configurationSource(corsConfigurationSource())
            .and()
                .logout()
                .logoutSuccessUrl(String.format(appConfig.getOauth2().getLogoutUrl(), URLEncoder.encode(appConfig.getOauth2().getRedirectAfterLogoutUrl(), "UTF-8")))
            .and()
                .csrf().disable()
            .authorizeRequests()
                // Allow all OPTIONS pre-flight requests
                .mvcMatchers(HttpMethod.OPTIONS).permitAll()

                // Allow access to specific urls without any credentials (e.g. health check)
                .antMatchers(appConfig.getUrls().getPermitAll()).permitAll()

                // Allow access to specific urls with authentication without needing the correct authority
                .antMatchers(appConfig.getUrls().getNeedsAuthentication()).authenticated()

                // Allow access to specific urls with authentication and the correct authority
                .antMatchers(appConfig.getUrls().getNeedsAuthorization()).hasAuthority(appConfig.getOauth2().getRequiredAuthority())

                // UI runs on / and should be allowed for all authenticated users
                .anyRequest().authenticated();

        addAuthenticationEntryPoint(http, sso.getLoginPath());
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

    /**
     * This method is copied from {@link ExceptionHandlingConfigurer} as we need a specific LoginUrlAuthenticationEntryPoint
     * @param http
     * @param loginPath
     * @throws Exception
     */
    private void addAuthenticationEntryPoint(HttpSecurity http, String loginPath) throws Exception {
        ExceptionHandlingConfigurer<HttpSecurity> exceptions = http.exceptionHandling();
        ContentNegotiationStrategy contentNegotiationStrategy = http
                .getSharedObject(ContentNegotiationStrategy.class);
        if (contentNegotiationStrategy == null) {
            contentNegotiationStrategy = new HeaderContentNegotiationStrategy();
        }

        // By default, return http status 401 UnAuthorized when X-Requested-With is specified
        // This behaviour is also the default, when no other match is being made (i.e. when no HTML is accepted)
        OAuth2AuthenticationWithLoginUrlEntryPoint entryPoint = new OAuth2AuthenticationWithLoginUrlEntryPoint(loginPath);
        exceptions.defaultAuthenticationEntryPointFor(
                entryPoint,
                new RequestHeaderRequestMatcher("X-Requested-With", "XMLHttpRequest"));

        // Otherwise, if HTML or an image is accepted, return a redirect to the login page
        MediaTypeRequestMatcher preferredMatcher = new MediaTypeRequestMatcher(
                contentNegotiationStrategy, MediaType.APPLICATION_XHTML_XML,
                new MediaType("image", "*"), MediaType.TEXT_HTML, MediaType.TEXT_PLAIN);
        preferredMatcher.setIgnoredMediaTypes(Collections.singleton(MediaType.ALL));
        exceptions.defaultAuthenticationEntryPointFor(
                loginUrlAuthenticationEntryPoint(loginPath),
                preferredMatcher);


    }


    public AuthenticationEntryPoint loginUrlAuthenticationEntryPoint(String loginPath) {
        LoginUrlAuthenticationEntryPoint entryPoint = new LoginUrlAuthenticationEntryPoint(loginPath);
        entryPoint.setForceHttps(true);
        return entryPoint;
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

