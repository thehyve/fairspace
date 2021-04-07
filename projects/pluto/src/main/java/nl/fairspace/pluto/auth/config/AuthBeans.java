package nl.fairspace.pluto.auth.config;

import nl.fairspace.pluto.auth.AuthConstants;
import nl.fairspace.pluto.auth.JwtTokenValidator;
import nl.fairspace.pluto.auth.model.OAuthAuthenticationToken;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;

import javax.servlet.http.HttpServletRequest;
import java.net.MalformedURLException;

@Configuration
@Slf4j
public class AuthBeans {
    private OidcConfig oidcConfig;

    @Autowired
    public AuthBeans(OidcConfig oidcConfig) {
        this.oidcConfig = oidcConfig;
    }

    @Bean
    JwtTokenValidator jwtTokenValidator() throws MalformedURLException {
        return JwtTokenValidator.create(oidcConfig.getJwkKeySetUrl().toURL(), oidcConfig.getAccessTokenJwkAlgorithm());
    }

    @Bean
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
    OAuthAuthenticationToken authenticationToken(HttpServletRequest request) {
        return (OAuthAuthenticationToken) request.getAttribute(AuthConstants.AUTHORIZATION_REQUEST_ATTRIBUTE);
    }
}
