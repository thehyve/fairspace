package nl.fairspace.pluto.app.config.dto;

import com.nimbusds.oauth2.sdk.auth.ClientAuthentication;
import com.nimbusds.oauth2.sdk.auth.ClientSecretBasic;
import com.nimbusds.oauth2.sdk.auth.Secret;
import com.nimbusds.oauth2.sdk.id.ClientID;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.net.URI;

@ConfigurationProperties(prefix = "security.oauth2")
@Configuration
@Data
public class SecurityConfig {
    private URI tokenUri;
    private String clientId;
    private String clientSecret;
    private String scope;
    private URI jwkKeySetUri;

    public ClientAuthentication getClientAuthentication() {
        return new ClientSecretBasic(new ClientID(clientId), new Secret(clientSecret));
    }
}
