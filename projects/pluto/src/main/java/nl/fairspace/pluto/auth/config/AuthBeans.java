package nl.fairspace.pluto.auth.config;

import java.net.MalformedURLException;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import nl.fairspace.pluto.auth.JwtTokenValidator;

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
}
