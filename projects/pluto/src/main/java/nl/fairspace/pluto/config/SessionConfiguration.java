package nl.fairspace.pluto.config;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.MapSessionRepository;
import org.springframework.session.config.annotation.web.http.EnableSpringHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

import nl.fairspace.pluto.config.dto.PlutoConfig;

@Configuration
@EnableSpringHttpSession
public class SessionConfiguration {
    @Autowired
    PlutoConfig plutoConfig;

    @Bean
    public MapSessionRepository sessionRepository() {
        return new MapSessionRepository(new HashMap<>());
    }

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName(plutoConfig.getSessionCookieName());
        serializer.setCookiePath("/");

        serializer.setDomainNamePattern("^([a-zA-Z0-9\\.-]+)$");
        return serializer;
    }
}
