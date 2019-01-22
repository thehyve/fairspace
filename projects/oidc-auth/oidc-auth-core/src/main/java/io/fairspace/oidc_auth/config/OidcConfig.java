package io.fairspace.oidc_auth.config;

import com.nimbusds.jose.JWSAlgorithm;
import lombok.Data;

import java.net.URI;

@Data
public class OidcConfig {
    private URI tokenUri;
    private URI authUri;
    private URI jwkKeySetUri;
    private JWSAlgorithm accessTokenJwkAlgorithm = JWSAlgorithm.RS256;
    private String logoutUri;
    private URI redirectAfterLogoutUri;
    private String clientId;
    private String clientSecret;
    private String scope;
}
