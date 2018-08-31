package io.fairspace.ceres.config


import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean
import org.springframework.boot.autoconfigure.security.oauth2.resource.ResourceServerProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurer
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter
import org.springframework.security.oauth2.config.annotation.web.configurers.ResourceServerSecurityConfigurer

@Configuration
@Profile("!noAuth")
@EnableResourceServer
class WebSecurityConfiguration {
    @Autowired
    lateinit var resourceServerProperties: ResourceServerProperties

    @Bean
    @ConditionalOnMissingBean(ResourceServerConfigurer::class)
    fun resourceServer(): ResourceServerConfigurer {
        return ResourceSecurityConfigurer(this.resourceServerProperties)
    }

    protected class ResourceSecurityConfigurer(private val resource: ResourceServerProperties) : ResourceServerConfigurerAdapter() {
        @Throws(Exception::class)
        override fun configure(resources: ResourceServerSecurityConfigurer?) {
            resources!!.resourceId(this.resource.resourceId)
        }

        @Throws(Exception::class)
        override fun configure(http: HttpSecurity) {
            http
                    .authorizeRequests()
                    .antMatchers("/actuator/health").permitAll()
                    .anyRequest().authenticated()
        }
    }

}
