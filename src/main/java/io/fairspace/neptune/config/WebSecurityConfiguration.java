package io.fairspace.neptune.config;

import io.fairspace.oidc_auth.filters.AnonymousCheckAuthenticationFilter;
import io.fairspace.oidc_auth.filters.AuthenticatedCheckAuthenticationFilter;
import io.fairspace.oidc_auth.filters.AuthorizedCheckAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;

@Configuration
@Profile("!noAuth")
@ComponentScan("io.fairspace.oidc_auth")
public class WebSecurityConfiguration {

    @Autowired
    private AppSecurityUrlProperties urlProperties;

    @Bean
    public FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter> authenticatedCheckAuthenticationFilter() {
        FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new AuthenticatedCheckAuthenticationFilter());

        filterRegBean.addUrlPatterns(urlProperties.getNeedsAuthentication());

        filterRegBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 202);
        return filterRegBean;
    }

    @Bean
    public FilterRegistrationBean<AnonymousCheckAuthenticationFilter> anonymousCheckAuthenticationFilter() {
        FilterRegistrationBean<AnonymousCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new AnonymousCheckAuthenticationFilter());

        filterRegBean.addUrlPatterns(urlProperties.getPermitAll());

        filterRegBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 204);
        return filterRegBean;
    }

}
