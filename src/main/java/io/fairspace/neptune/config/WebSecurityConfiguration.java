package io.fairspace.neptune.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;

@Configuration
@Profile("!dev")
@EnableResourceServer
public class WebSecurityConfiguration { }
