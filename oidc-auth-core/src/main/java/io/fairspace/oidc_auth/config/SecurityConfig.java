package io.fairspace.oidc_auth.config;

import lombok.Data;

@Data
public class SecurityConfig {
    private OAuth2Config oauth2;
    private AppSecurityUrlConfig urls;
}
