package io.fairspace.saturn.auth.spring;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthConverter jwtAuthConverter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers(req -> req.getServletPath().contains("/api/health"))
                        .permitAll()
                        .requestMatchers(req -> req.getServletPath().endsWith("/favicon.ico"))
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer((oauth2) -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter)))
                .sessionManagement(
                        (sessionManagement) -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling((exceptionHandling) ->
                        exceptionHandling.authenticationEntryPoint(new UnauthorizedEntryPoint()))
                .cors(Customizer.withDefaults()); // todo: check that cors enabled

        return http.build();
    }

}
