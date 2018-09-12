package io.fairspace.oidc_auth.config;

import lombok.Data;

import java.net.URI;

@Data
public class OAuth2Config {
    private URI tokenUri;
    private URI authUri;
    private URI jwkKeySetUri;
    private String logoutUri;
    private URI redirectAfterLogoutUri;
    private String clientId;
    private String clientSecret;
    private String scope;
    private String requiredAuthority;

}
