package io.fairspace.ceres.config


import io.fairspace.oidc_auth.filters.AnonymousCheckAuthenticationFilter
import io.fairspace.oidc_auth.filters.AuthenticatedCheckAuthenticationFilter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.web.servlet.FilterRegistrationBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.Ordered

@Configuration
@Profile("!noAuth")
@ComponentScan("io.fairspace.oidc_auth")
class WebSecurityConfiguration {
    @Autowired
    lateinit var urlProperties: AppSecurityUrlProperties


    @Bean
    fun authenticatedCheckAuthenticationFilter(): FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter> {
        val filterRegBean = FilterRegistrationBean<AuthenticatedCheckAuthenticationFilter>()
        filterRegBean.setFilter(AuthenticatedCheckAuthenticationFilter())

        filterRegBean.addUrlPatterns(*urlProperties.needsAuthentication)

        filterRegBean.order = Ordered.HIGHEST_PRECEDENCE + 202
        return filterRegBean
    }

    @Bean
    fun anonymousCheckAuthenticationFilter(): FilterRegistrationBean<AnonymousCheckAuthenticationFilter> {
        val filterRegBean = FilterRegistrationBean<AnonymousCheckAuthenticationFilter>()
        filterRegBean.setFilter(AnonymousCheckAuthenticationFilter())

        filterRegBean.addUrlPatterns(*urlProperties.permitAll)

        filterRegBean.order = Ordered.HIGHEST_PRECEDENCE + 204
        return filterRegBean
    }


}
