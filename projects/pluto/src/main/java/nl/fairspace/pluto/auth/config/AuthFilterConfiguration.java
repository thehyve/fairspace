package nl.fairspace.pluto.auth.config;

import nl.fairspace.pluto.auth.AuthorizationFailedHandler;
import nl.fairspace.pluto.auth.JwtTokenValidator;
import nl.fairspace.pluto.auth.filters.AnonymousCheckAuthenticationFilter;
import nl.fairspace.pluto.auth.filters.AuthenticatedCheckAuthenticationFilter;
import nl.fairspace.pluto.auth.filters.AuthorizedCheckAuthenticationFilter;
import nl.fairspace.pluto.auth.filters.HandleFailedAuthenticationFilter;
import nl.fairspace.pluto.auth.filters.HeaderAuthenticationFilter;
import nl.fairspace.pluto.auth.OAuthFlow;
import nl.fairspace.pluto.auth.filters.SessionAuthenticationFilter;
import nl.fairspace.pluto.auth.filters.UsernamePasswordAuthenticationFilter;
import nl.fairspace.pluto.config.dto.AppSecurityUrlConfig;
import nl.fairspace.pluto.config.dto.OidcConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;

@Configuration
@Profile("!noAuth")
@ComponentScan("nl.fairspace.pluto.auth")
public class AuthFilterConfiguration {
    @Autowired
    private OidcConfiguration oidcConfiguration;

    @Autowired
    private AppSecurityUrlConfig urlConfig;

    @Autowired
    private OAuthFlow oAuthFlow;

    @Bean
    @Autowired
    public FilterRegistrationBean<SessionAuthenticationFilter> sessionAuthenticationFilter(JwtTokenValidator jwtTokenValidator, OAuthFlow oAuthFlow) {
        FilterRegistrationBean<SessionAuthenticationFilter> registration = new FilterRegistrationBean<>();
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 100);
        registration.setFilter(new SessionAuthenticationFilter(jwtTokenValidator, oAuthFlow));
        return registration;
    }

    @Bean
    public FilterRegistrationBean<UsernamePasswordAuthenticationFilter> usernamePasswordAuthenticationFilter() {
        FilterRegistrationBean<UsernamePasswordAuthenticationFilter> registration = new FilterRegistrationBean<>();
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 101);
        registration.setFilter(new UsernamePasswordAuthenticationFilter(oAuthFlow));
        return registration;
    }

    @Bean
    @Autowired
    public FilterRegistrationBean<HeaderAuthenticationFilter> bearerAuthenticationFilter(JwtTokenValidator jwtTokenValidator) {
        FilterRegistrationBean<HeaderAuthenticationFilter> registration = new FilterRegistrationBean<>();
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 102);
        registration.setFilter(new HeaderAuthenticationFilter(jwtTokenValidator));
        return registration;
    }

    @Bean
    public FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter> authenticatedCheckAuthenticationFilter() {
        FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new AuthenticatedCheckAuthenticationFilter());

        filterRegBean.addUrlPatterns(urlConfig.getNeedsAuthentication());

        filterRegBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 202);
        return filterRegBean;
    }

    @Bean
    public FilterRegistrationBean<AuthorizedCheckAuthenticationFilter> authorizedCheckAuthenticationFilter() {
        FilterRegistrationBean<AuthorizedCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new AuthorizedCheckAuthenticationFilter(oidcConfiguration.getRequiredAuthority()));

        filterRegBean.addUrlPatterns(urlConfig.getNeedsAuthorization());

        filterRegBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 203);
        return filterRegBean;
    }

    @Bean
    public FilterRegistrationBean<AnonymousCheckAuthenticationFilter> anonymousCheckAuthenticationFilter() {
        FilterRegistrationBean<AnonymousCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new AnonymousCheckAuthenticationFilter());

        filterRegBean.addUrlPatterns(urlConfig.getPermitAll());

        filterRegBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 204);
        return filterRegBean;
    }

    @Bean
    public FilterRegistrationBean<HandleFailedAuthenticationFilter> handleFailedAuthenticationFilter() {
        FilterRegistrationBean<HandleFailedAuthenticationFilter> registration = new FilterRegistrationBean<>();
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 300);
        registration.setFilter(new HandleFailedAuthenticationFilter(new AuthorizationFailedHandler()));
        return registration;
    }
}
