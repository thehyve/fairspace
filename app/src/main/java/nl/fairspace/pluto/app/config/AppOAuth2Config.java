package nl.fairspace.pluto.app.config;

import lombok.Data;

@Data
public class AppOAuth2Config {
    private String baseUrl;
    private String realm;
    private String logoutUrl;
    private String redirectAfterLogoutUrl;
    private String requiredAuthority;
}
