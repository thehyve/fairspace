package nl.fairspace.pluto.app.config;

import nl.fairspace.pluto.app.config.ApiTokenAccessFilter;
import nl.fairspace.pluto.app.config.OAuth2AuthenticationWithLoginUrlEntryPoint;
import nl.fairspace.pluto.app.config.dto.AppConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2SsoProperties;
import org.springframework.boot.autoconfigure.security.oauth2.resource.UserInfoRestTemplateFactory;
import org.springframework.cloud.sleuth.SpanAdjuster;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
import org.springframework.security.oauth2.provider.token.ResourceServerTokenServices;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.security.web.util.matcher.RequestHeaderRequestMatcher;
import org.springframework.util.MultiValueMap;
import org.springframework.web.accept.ContentNegotiationStrategy;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;
import zipkin2.Span;

import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

@Configuration
public class TracingConfiguration {

    public static final String HTTP_METHOD_TAG = "http.method";
    public static final String HTTP_PATH_TAG = "http.path";

    @Bean
    SpanAdjuster spanAdjuster() {
        return span -> {
            Map<String, String> tags = span.tags();

            if(tags.containsKey(HTTP_METHOD_TAG) &&
                    tags.containsKey(HTTP_PATH_TAG) &&
                    span.name().equalsIgnoreCase(tags.get(HTTP_METHOD_TAG))) {
                return span.toBuilder().name(tags.get(HTTP_METHOD_TAG) + " " + tags.get(HTTP_PATH_TAG)).build();
            } else {
                return span;
            }
        };
    }
}

