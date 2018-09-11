package nl.fairspace.pluto.app.auth.config;

import nl.fairspace.pluto.app.auth.AuthorizationFailedHandler;
import nl.fairspace.pluto.app.auth.JwtTokenValidator;
import nl.fairspace.pluto.app.auth.OAuthTokenRefresher;
import nl.fairspace.pluto.app.auth.filters.AuthenticatedCheckAuthenticationFilter;
import nl.fairspace.pluto.app.auth.filters.AuthorizedCheckAuthenticationFilter;
import nl.fairspace.pluto.app.auth.filters.HeaderAuthenticationFilter;
import nl.fairspace.pluto.app.auth.filters.SessionAuthenticationFilter;
import nl.fairspace.pluto.app.config.dto.AppConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;

@Configuration
@Profile("!noAuth")
public class AuthFilterConfiguration {
    @Autowired
    private JwtTokenValidator jwtTokenValidator;

    @Autowired
    private OAuthTokenRefresher tokenRefresher;

    @Autowired
    private AuthorizationFailedHandler failedHandler;

    @Autowired
    private AppConfig appConfig;

    @Bean
    public FilterRegistrationBean<SessionAuthenticationFilter> sessionAuthenticationFilter() {
        FilterRegistrationBean<SessionAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new SessionAuthenticationFilter(jwtTokenValidator, tokenRefresher));
        filterRegBean.setOrder(Ordered.LOWEST_PRECEDENCE - 5);
        return filterRegBean;
    }

    @Bean
    public FilterRegistrationBean<HeaderAuthenticationFilter> headerAuthenticationFilter() {
        FilterRegistrationBean<HeaderAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new HeaderAuthenticationFilter(jwtTokenValidator));
        filterRegBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 100);
        return filterRegBean;
    }

    @Bean
    public FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter> authenticatedCheckAuthenticationFilter() {
        FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new AuthenticatedCheckAuthenticationFilter(failedHandler));

        filterRegBean.addUrlPatterns(appConfig.getUrls().getNeedsAuthentication());

        filterRegBean.setOrder(Ordered.LOWEST_PRECEDENCE - 3);
        return filterRegBean;
    }

    @Bean
    public FilterRegistrationBean<AuthorizedCheckAuthenticationFilter> authorizedCheckAuthenticationFilter() {
        FilterRegistrationBean<AuthorizedCheckAuthenticationFilter> filterRegBean = new FilterRegistrationBean<>();
        filterRegBean.setFilter(new AuthorizedCheckAuthenticationFilter(failedHandler, appConfig.getOauth2().getRequiredAuthority()));

        filterRegBean.addUrlPatterns(appConfig.getUrls().getNeedsAuthorization());

        filterRegBean.setOrder(Ordered.LOWEST_PRECEDENCE - 2);
        return filterRegBean;
    }
}
