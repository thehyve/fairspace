package nl.fairspace.pluto.app.auth.config;

import com.nimbusds.oauth2.sdk.auth.ClientAuthentication;
import com.nimbusds.oauth2.sdk.auth.ClientSecretBasic;
import com.nimbusds.oauth2.sdk.auth.Secret;
import com.nimbusds.oauth2.sdk.id.ClientID;
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

    public ClientAuthentication getClientAuthentication() {
        return new ClientSecretBasic(new ClientID(clientId), new Secret(clientSecret));
    }
}
