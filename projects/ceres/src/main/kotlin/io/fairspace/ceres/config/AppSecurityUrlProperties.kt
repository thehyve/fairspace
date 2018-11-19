package io.fairspace.ceres.config

import lombok.Data
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

/**
 * Specifies the url patterns that are allowed for anyone, only
 * need authentication (user is logged in) or need full authorization
 * (i.e. user has the required authority to login)
 */
@ConfigurationProperties(prefix = "security.urls")
@Configuration
class AppSecurityUrlProperties() {
    lateinit var permitAll: Array<String>
    lateinit var needsAuthentication: Array<String>
}