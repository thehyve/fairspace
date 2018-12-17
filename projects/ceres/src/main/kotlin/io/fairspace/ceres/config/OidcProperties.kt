package io.fairspace.ceres.config

import io.fairspace.oidc_auth.config.OidcConfig
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@ConfigurationProperties(prefix = "security.oidc")
@Configuration
class OidcProperties : OidcConfig()
