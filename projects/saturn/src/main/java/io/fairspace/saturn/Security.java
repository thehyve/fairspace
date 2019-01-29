package io.fairspace.saturn;

import org.eclipse.jetty.security.ConstraintMapping;
import org.eclipse.jetty.security.ConstraintSecurityHandler;
import org.eclipse.jetty.security.SecurityHandler;
import org.eclipse.jetty.util.security.Constraint;
import org.keycloak.adapters.jetty.KeycloakJettyAuthenticator;
import org.keycloak.representations.adapters.config.AdapterConfig;

class Security {
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
}
