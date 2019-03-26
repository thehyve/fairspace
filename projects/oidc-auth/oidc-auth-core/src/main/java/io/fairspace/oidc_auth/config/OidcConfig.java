package io.fairspace.oidc_auth.config;

import com.nimbusds.jose.JWSAlgorithm;
import lombok.Data;

import java.net.URI;

@Data
public class OidcConfig {
    private URI tokenUrl;
    private URI authUrl;
    private URI jwkKeySetUrl;
    private JWSAlgorithm accessTokenJwkAlgorithm = JWSAlgorithm.RS256;
    private String logoutUrl;
    private URI redirectAfterLogoutUrl;
    private String clientId;
    private String clientSecret;
    private String scope;
}
