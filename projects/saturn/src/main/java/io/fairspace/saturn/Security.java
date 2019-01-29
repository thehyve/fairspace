package io.fairspace.saturn;

import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.security.UserAuthentication;
import org.eclipse.jetty.server.Authentication;
import org.eclipse.jetty.util.security.Constraint;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.adapters.jetty.KeycloakJettyAuthenticator;
import org.keycloak.representations.adapters.config.AdapterConfig;

import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

public class Security {
    static SecurityHandler createSecurityHandler(String jwksProviderUrl, String authRealm, String authRole) {
        return new ConstraintSecurityHandler() {{
            setAuthenticator(new KeycloakJettyAuthenticator() {{
                setAdapterConfig(new AdapterConfig() {{
                    setAuthServerUrl(jwksProviderUrl);
                    setRealm(authRealm);
                    setResource("saturn");
                }});
            }});
            addConstraintMapping(new ConstraintMapping() {{
                setPathSpec("/health");
                setConstraint(new Constraint() {{
                    setName("noauth");
                    setAuthenticate(false);
                }});
            }});
            addConstraintMapping(new ConstraintMapping() {{
                        setPathSpec("/*");
                        setConstraint(new Constraint() {{
                            setName("auth");
                            setAuthenticate(true);
                            setRoles(new String[] {authRole});
                        }});
                    }});
        }};
    }

    public static UserAuthentication getAuthentication() {
        var connection = getCurrentConnection();
        if (connection == null) {
            return null;
        }
        var jettyRequest = connection.getHttpChannel().getRequest();
        if (jettyRequest == null) {
            return null;
        }

        return (UserAuthentication) jettyRequest.getAuthentication();
    }

    public static KeycloakPrincipal getUserPrincipal() {
        var auth = getAuthentication();
        return auth == null ? null : (KeycloakPrincipal) auth.getUserIdentity().getUserPrincipal();
    }

    public static UserInfo getUserInfo() {
        var principal = getUserPrincipal();
        if (principal == null) {
            return null;
        }
        var token = principal.getKeycloakSecurityContext().getToken();
        return new UserInfo(token.getSubject(), token.getPreferredUsername(), token.getName(), token.getRealmAccess().getRoles());
    }
}
