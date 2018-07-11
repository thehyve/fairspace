package nl.fairspace.pluto.app.config;

import lombok.Data;

import java.util.List;

/**
 * Specifies the url patterns that are allowed for anyone, only
 * need authentication (user is logged in) or need full authorization
 * (i.e. user has the required authority to login)
 */
@Data
public class AppSecurityUrlConfig {
    private String[] permitAll = new String[0];
    private String[] needsAuthentication = new String[0];
    private String[] needsAuthorization = new String[0];
}
