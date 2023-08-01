package nl.fairspace.pluto.auth.config;

import nl.fairspace.pluto.auth.AuthorizationFailedHandler;
import nl.fairspace.pluto.auth.JwtTokenValidator;
import nl.fairspace.pluto.auth.OAuthFlow;
import nl.fairspace.pluto.auth.filters.*;
import nl.fairspace.pluto.config.dto.AppSecurityUrlConfig;
import nl.fairspace.pluto.config.dto.OidcConfiguration;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.util.Arrays;

@Configuration
@Profile("!noAuth")
@ComponentScan("nl.fairspace.pluto.auth")
public class AuthFilterConfiguration {
    private final OidcConfiguration oidcConfiguration;

    private final AppSecurityUrlConfig urlConfig;

    private final OAuthFlow oAuthFlow;

    final
    JwtTokenValidator jwtTokenValidator;

    public AuthFilterConfiguration(OidcConfiguration oidcConfiguration, AppSecurityUrlConfig urlConfig, OAuthFlow oAuthFlow, JwtTokenValidator jwtTokenValidator) {
        this.oidcConfiguration = oidcConfiguration;
        this.urlConfig = urlConfig;
        this.oAuthFlow = oAuthFlow;
        this.jwtTokenValidator = jwtTokenValidator;
    }
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 100)
    public GlobalFilter sessionAuthenticationFilter() {
        return (exchange, chain) -> new SessionAuthenticationFilter(jwtTokenValidator, oAuthFlow).filter(exchange, chain);
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 101)
    public GlobalFilter usernamePasswordAuthenticationFilter() {
        return (exchange, chain) -> new UsernamePasswordAuthenticationFilter(oAuthFlow).filter(exchange, chain);
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 102)
    public GlobalFilter bearerAuthenticationFilter() {
        return (exchange, chain) -> new HeaderAuthenticationFilter(jwtTokenValidator).filter(exchange, chain);
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 203)
    public GlobalFilter authorizedCheckAuthenticationFilter() {
        return (exchange, chain) -> new AuthorizedCheckAuthenticationFilter(oidcConfiguration.getRequiredAuthority()).filter(exchange, chain);
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 204)
    public GlobalFilter anonymousCheckAuthenticationFilter() {
        return (exchange, chain) -> {
            if (Arrays.stream(urlConfig.getPermitAll()).anyMatch(s -> s.equals(exchange.getRequest().getPath().toString()))) {
                return new AnonymousCheckAuthenticationFilter().filter(exchange, chain);
            }
            return chain.filter(exchange);
        };
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE + 300)
    public GlobalFilter handleFailedAuthenticationFilter() {
        return (exchange, chain) -> new HandleFailedAuthenticationFilter(new AuthorizationFailedHandler()).filter(exchange, chain);
    }
}
