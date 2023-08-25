package nl.fairspace.pluto.auth.config;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.auth.JwtTokenValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
}
